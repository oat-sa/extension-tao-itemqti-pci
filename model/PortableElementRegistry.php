<?php
/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\qtiItemPci\model;

use \common_ext_ExtensionsManager;
use oat\oatbox\service\ConfigurableService;
use oat\qtiItemPci\model\common\model\PortableElementModel;
use oat\qtiItemPci\model\common\PortableElementFactory;
use oat\qtiItemPci\model\pci\model\PciModel;
use oat\tao\model\websource\Websource;
use League\Flysystem\Filesystem;
use oat\oatbox\filesystem\FileSystemService;
use oat\tao\model\websource\WebsourceManager;
use Slim\Http\Stream;

/**
 * CreatorRegistry stores reference to
 *
 * @package qtiItemPci
 */
class PortableElementRegistry extends ConfigurableService
{
    const OPTION_FS = 'filesystem';
    const OPTION_WEBSOURCE = 'websource';
    const OPTION_REGISTRY = 'registry';
    const OPTION_STORAGE = 'storage';

    protected $storage;
    protected $source;

    /**
     * Return all PCIs from self::CONFIG_ID mapping
     *
     * @return array
     * @throws \common_ext_ExtensionException
     */
    protected function getMap()
    {
        $map = \common_ext_ExtensionsManager::singleton()->getExtensionById('qtiItemPci')->getConfig(
            $this->getOption(self::OPTION_REGISTRY)
        );
        if(empty($map)){
            $map = [];
        }
        return $map;
    }

    /**
     * Set PCIs from self::CONFIG_ID mapping
     *
     * @param $map
     * @throws \common_ext_ExtensionException
     */
    protected function setMap($map)
    {
        \common_ext_ExtensionsManager::singleton()->getExtensionById('qtiItemPci')->setConfig(
            $this->getOption(self::OPTION_REGISTRY), $map
        );
    }

    /**
     * Get the fly filesystem based on OPTION_FS configuration
     *
     * @return Filesystem
     */
    public function getFileSystem()
    {
        if (!$this->storage) {
            $this->storage = $this
                ->getServiceLocator()
                ->get(FileSystemService::SERVICE_ID)
                ->getFileSystem($this->getOption(self::OPTION_FS));
        }
        return $this->storage;
    }

    /**
     * Get the access provider following websource defined in OPTION_WEBSOURCE
     *
     * @return Websource
     */
    protected function getAccessProvider()
    {
        return WebsourceManager::singleton()->getWebsource($this->getOption(self::OPTION_WEBSOURCE));
    }

    /**
     * Get the file url from a given relpath from PCI
     *
     * @param $typeIdentifier
     * @param $version
     * @param $relPath
     * @return string
     */
    protected function getFileUrl($typeIdentifier, $version, $relPath)
    {
        return $this->getAccessProvider()->getAccessUrl($this->getPrefix(new PciModel($typeIdentifier, $version)) . $relPath);
    }

    /**
     * Transform couple of $id, $version to key
     *
     * @param PciModel $pciModel
     * @return string
     */
    protected function getPrefix(PortableElementModel $model)
    {
        return md5($model->getTypeIdentifier() . $model->getVersion()) . DIRECTORY_SEPARATOR;
    }

    /**
     * Set source of directory where extracted zip is located
     *
     * @param $source
     * @return $this
     * @throws \common_Exception
     */
    public function setSource($source)
    {
        if (!is_dir($source)) {
            throw new \common_Exception('Unable to locate the source directory.');
        }
        $this->source = DIRECTORY_SEPARATOR . trim($source, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        return $this;
    }

    /**
     * Get zip file source
     *
     * @return mixed
     */
    public function getSource()
    {
        return $this->source;
    }

    /**
     * Register files associated to a PCI track by $typeIdentifier
     *
     * @param PciModel $pciModel
     * @param $files
     * @return bool
     * @throws \common_Exception
     */
    protected function registerFiles(PortableElementModel $model, $files)
    {
        $registered = false;
        $fileSystem = $this->getFileSystem();

        if (!$this->getSource()) {
            throw new \common_Exception('The source directory is not correctly set.');
        }

        foreach ($files as $file) {
            if (substr($file, 0, 2)!='./') {
                // File is not relative, it's a shared libraries
                // Ignore this file, front have fallBack
                continue;
            }

            $filePath = $this->getSource() . $file;
            if (!file_exists($filePath) || ($resource = fopen($filePath, 'r'))===false) {
                throw new \common_Exception('File cannot be opened : ' . $filePath);
            }

            $fileId = $this->getPrefix($model) . $file;
            if ($fileSystem->has($fileId)) {
                $registered = $fileSystem->updateStream($fileId, $resource);
            } else {
                $registered = $fileSystem->writeStream($fileId, $resource);
            }
            fclose($resource);
            \common_Logger::i('Portable element asset file "' . $fileId . '" copied.');
        }
        return $registered;
    }

    /**
     * Unregister files by removing them from FileSystem
     *
     * @param PciModel $pciModel
     * @param $files
     * @return bool
     * @throws \common_Exception
     */
    protected function unregisterFiles(PortableElementModel $model, $files)
    {
        $deleted = true;
        $filesystem = $this->getFileSystem();
        foreach ($files as $relPath) {
            $fileId = $this->getPrefix($model) . $relPath;
            if (!$filesystem->has($fileId)) {
                throw new \common_Exception('File does not exists in the filesystem: ' . $relPath);
            }
            $deleted = $filesystem->delete($fileId);
        }
        return $deleted;
    }

    /**
     * Return the last version of a PCI track by $typeIdentifier
     *
     * @param $typeIdentifier
     * @return mixed|null
     */
    public function getLatestVersion($typeIdentifier)
    {
        return $this->get($typeIdentifier);
    }

    /**
     * Check if PCI exists into self::CONFIG_ID mapping
     *
     * @param PciModel $pciModel
     * @return bool
     */
    public function exists(PortableElementModel $model)
    {
        $pcis = $this->getMap();

        if (empty($pcis) || !isset($pcis[$model->getTypeIdentifier()])) {
            return false;
        }

        if (!$model->hasVersion()) {
            $model = $this->getLatestVersion($model->getTypeIdentifier());
        }

        if ($model !== null) {
            return (isset($pcis[$model->getTypeIdentifier()][$model->getVersion()]));
        }

        return false;
    }

    /**
     * Get a PCI from identifier/version
     *
     * @param $identifier
     * @param null $version
     * @return $pciModel|null
     */
    public function get($identifier, $version=null)
    {
        $pcis = $this->getMap();
        if (!isset($pcis[$identifier])) {
            return null;
        }

        $model = new PciModel();
        $pci = $pcis[$identifier];
        if (is_null($version) && !empty($pci)) {
            //return the latest version
            krsort($pci);
            return $model->exchangeArray(reset($pci));
        } else {
            if (isset($pci[$version])) {
                return $model->exchangeArray($pci[$version]);
            } else {
                return null;
            }
        }
    }

    /**
     * Populate a PciModel from PCIs map
     *
     * @param PciModel $pciModel
     * @return $this|null|PciRegistry
     */
    public function retrieve(PortableElementModel $model)
    {
        return $this->get($model->getTypeIdentifier(), $model->getVersion());
    }

    /**
     * Register a PCI in a specific version
     *
     * @param PciModel $pciModel
     * @throws \common_Exception
     */
    public function register(PortableElementModel $model)
    {
        $latestVersion = $this->getLatestVersion($model->getTypeIdentifier());
        if ($latestVersion) {
            if(version_compare($model->getVersion(), $latestVersion->getVersion(), '<')){
                throw new \common_Exception('A newer version of the code already exists ' . $latestVersion->getVersion());
            }
        }

        $pcis = $this->getMap();
        $pcis[$model->getTypeIdentifier()][$model->getVersion()] = $model->toArray();
        $this->setMap($pcis);

        $files = $this->getFilesFromPortableElement($model);
        $this->registerFiles($model, $files);
    }

    /**
     *
     * @param PciModel $pciModel
     * @return array
     * @throws \common_Exception
     */
    protected function getFilesFromPortableElement(PortableElementModel $model)
    {
        $validator = PortableElementFactory::getValidator($model);
        return $validator->getRequiredAssets();
    }

    /**
     * Return the absolute url of PCI storage
     *
     * @param $typeIdentifier
     * @param string $version
     * @return bool|string
     */
    public function getBaseUrl($typeIdentifier, $version = null)
    {
        $model = new PciModel($typeIdentifier, $version);
        if ($this->exists($model)) {
            return $this->getFileUrl($typeIdentifier, $version, '');
        }
        return false;
    }

    /**
     * @param PortableElementModel $model
     * @param $file
     * @return bool|false|resource
     * @throws \common_Exception
     */
    public function getFileStream(PortableElementModel $model, $file)
    {
        $filePath = $this->getPrefix($model) . $file;
        if ($this->getFileSystem()->has($filePath)) {
            return new Stream($this->getFileSystem()->readStream($filePath));
        }
        throw new \tao_models_classes_FileNotFoundException($filePath);
    }

    /**
     * Unregister PCI by removing the given version data & asset files
     * If $pciModel doesn't have version, all versions will be removed
     *
     * @param PciModel $pciModel
     * @return bool
     * @throws \common_Exception
     */
    public function unregister(PortableElementModel $model)
    {
        if (!$this->exists($model)) {
            throw new \InvalidArgumentException('Identifier "' . $model->getTypeIdentifier() . '" to remove is not found in PCI map');
        }
        
        $this->removeAssets($model);
        $this->removeMapPci($model);
        return true;
    }

    /**
     * Return the runtime of PCI
     *
     * @param $typeIdentifier
     * @param string $version
     * @return array|string
     * @throws \common_Exception
     */
    protected function getRuntime($typeIdentifier, $version = '')
    {
        $pcis = $this->getMap();
        if (isset($pcis[$typeIdentifier])) {
            if (empty($version)) {
                $version = $this->getLatestVersion($typeIdentifier)->getVersion();
            }
            if  ($pcis[$typeIdentifier][$version]) {
                $pci = $this->addPathPrefix($typeIdentifier, $pcis[$typeIdentifier][$version]);
                $pci['version'] = $version;
                $pci['baseUrl'] = $this->getBaseUrl($typeIdentifier, $version);
                return $pci;
            } else {
                throw new \common_Exception('The pci does not exist in the requested version : '.$typeIdentifier.' '.$version);
            }
        } else {
            throw new \common_Exception('The pci does not exist : '.$typeIdentifier);
        }
    }
    
    /**
     * Return the path prefix associated to couple of $identifier/$var
     *
     * @param $typeIdentifier
     * @param $var
     * @return array|string
     */
    protected function addPathPrefix($typeIdentifier, $var)
    {
        if (is_string($var)) {
            return preg_replace('/^(.\/)(.*)/', $typeIdentifier."/$2", $var);
        } elseif (is_array($var)) {
            foreach ($var as $k => $v) {
                $var[$k] = $this->addPathPrefix($typeIdentifier, $v);
            }
            return $var;
        } else if (is_null($var)) {
            return '';
        } else {
            throw new \InvalidArgumentException("$var must be a string or an array");
        }
    }

    /**
     * Get all PCI in latest version
     *
     * @return array
     * @throws \common_Exception
     */
    public function getLatestRuntimes()
    {
        $all = [];
        $pcis = array_keys($this->getMap());
        foreach ($pcis as $typeIdentifier) {
            $model = $this->getLatestVersion($typeIdentifier);
            $pci = $this->getRuntime($typeIdentifier, $model->getVersion());
            $all[$typeIdentifier] = [$pci];
        }
        return $all;
    }


    public function getLatestCreators()
    {
        $all = [];
        $pcis = array_keys($this->getMap());
        foreach ($pcis as $typeIdentifier) {
            $model = $this->getLatestVersion($typeIdentifier);
            if(!empty($model->getCreator())){
                $all[$typeIdentifier] = $model;
            }
        }
        return $all;
    }
    
    /**
     * Unregister all previously registered pci, in all version
     * Remove all assets
     */
    public function unregisterAll()
    {
        $pcis = $this->getMap();
        foreach(array_keys($pcis) as $typeIdentifier){
            $this->removeAssets(new PciModel($typeIdentifier));
        }
        $this->setMap([]);
        return true;
    }
    
    /**
     * Unregister a previously registered pci, in all version
     */
    public function unregisterPortableElement($typeIdentifier)
    {
        $unregistered = true;
        $pcis = $this->getMap();
        if(isset($pcis[$typeIdentifier])){
            foreach(array_keys($pcis[$typeIdentifier]) as $version){
                $unregistered &= $this->unregister(new PciModel($typeIdentifier, $version));
            }
        }
        return $unregistered;
    }

    /**
     * Remove a record in PCIs map by identifier
     *
     * @param PciModel $pciModel
     * @return bool
     * @throws \common_Exception
     */
    protected function removeMapPci(PortableElementModel $model)
    {
        $pcis = $this->getMap();
        if (isset($pcis[$model->getTypeIdentifier()]) &&
            isset($pcis[$model->getTypeIdentifier()][$model->getVersion()])
        ) {
            unset($pcis[$model->getTypeIdentifier()]);
            $this->setMap($pcis);
            return true;
        }
        throw new \common_Exception('Unable to find Pci into PCIs map. Deletion impossible.');
    }

    /**
     * Get a record in PCIs map by identifier
     *
     * @param PciModel $pciModel
     * @return null
     */
    protected function getMapPci(PortableElementModel $model)
    {
        $pcis = $this->getMap();
        if (isset($pcis[$model->getTypeIdentifier()])) {
            return $pcis[$model->getTypeIdentifier()];
        }
        return null;
    }

    /**
     * Remove all registered files for a PCI identifier from FileSystem
     * If $targetedVersion is given, remove only assets for this version
     *
     * @param PciModel $pciModel
     * @return bool
     * @throws \common_Exception
     */
    protected function removeAssets(PortableElementModel $model)
    {
        $versions = $this->getMapPci($model);
        if (!$versions) {
            return true;
        }
        foreach ($versions as $version => $files) {
            if (!$model->hasVersion() || $version==$model->getVersion()) {

                $hook        = (isset($files['hook']) && is_array($files['hook'])) ? $files['hook'] : [];
                $libs        = (isset($files['libs']) && is_array($files['libs'])) ? $files['libs'] : [];
                $stylesheets = (isset($files['stylesheets']) && is_array($files['stylesheets'])) ? $files['stylesheets'] : [];
                $mediaFiles  = (isset($files['mediaFiles']) && is_array($files['mediaFiles'])) ? $files['mediaFiles'] : [];

                $allFiles = array_merge($hook, $libs, $stylesheets, $mediaFiles);
                if (empty($allFiles)) {
                    continue;
                }
                if (!$this->unregisterFiles($model, array_keys($allFiles))) {
                    throw new \common_Exception('Unable to delete asset files for PCI "' . $model->getTypeIdentifier()
                        . '" at version "' . $model->getVersion() . '"');
                }
            }
        }
        return true;
    }

    /**
     * Create an temp export tree and return path
     *
     * @param PciModel $pciModel
     * @return string
     */
    protected function getZipLocation(PortableElementModel $model)
    {
        return \tao_helpers_Export::getExportPath() . DIRECTORY_SEPARATOR . 'pciPackage_' . $model->getTypeIdentifier() . '.zip';
    }

    /**
     * Get list of files following Pci Model
     *
     * @param PciModel $pciModel
     * @return array
     * @throws \common_Exception
     */
    protected function getFilesFromModel(PortableElementModel $model)
    {
        $validator = PortableElementFactory::getValidator($model);
        return $validator->getRequiredAssets();
    }

    /**
     * Get manifest representation of Pci Model
     *
     * @param PciModel $pciModel
     * @return string
     */
    public function getManifest(PortableElementModel $model)
    {
        return json_encode($model->toArray(), JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);
    }

    /**
     * Export a pci to a zip package
     *
     * @param PciModel $pciModel
     * @return string
     * @throws \common_Exception
     */
    public function export(PortableElementModel $model)
    {
        $zip = new \ZipArchive();
        $path = $this->getZipLocation($model);

        if ($zip->open($path, \ZipArchive::CREATE) !== TRUE) {
            throw new \common_Exception('Unable to create zipfile ' . $path);
        }

        $manifest = $this->getManifest($model);
        $zip->addFromString($model->getManifestName(), $manifest);

        $files = $this->getFilesFromModel($model);
        foreach ($files as $file)
        {
            $filePath = $this->getPrefix($model) . $file;
            if ($this->getFileSystem()->has($filePath)) {
                $fileContent = $this->getFileSystem()->read($filePath);
                $zip->addFromString($file, $fileContent);
            }
        }

        $zip->close();
        return $path;
    }

    /**
     *
     * @todo
     * @param string $typeIdentifier
     * @param string $sourceVersion
     * @param string $targetVersion
     * @param array $runtime
     * @param array $creator
     */
    public function update($typeIdentifier, $sourceVersion, $targetVersion, $runtime = [], $creator = []){

    }
}
