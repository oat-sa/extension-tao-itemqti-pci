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
use oat\qtiItemPci\model\validation\PciModelValidator;
use oat\tao\model\websource\Websource;
use League\Flysystem\Filesystem;
use oat\oatbox\filesystem\FileSystemService;
use oat\tao\model\websource\WebsourceManager;

/**
 * CreatorRegistry stores reference to
 *
 * @package qtiItemPci
 */
class PciRegistry extends ConfigurableService
{
    const SERVICE_ID = 'qtiItemPci/pciRegistry';

    const OPTION_FS = 'filesystem';

    const OPTION_WEBSOURCE = 'websource';
    
    const CONFIG_ID = 'pciRegistryEntries';

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
        return \common_ext_ExtensionsManager::singleton()->getExtensionById('qtiItemPci')->getConfig(self::CONFIG_ID);
    }

    /**
     * Set PCIs from self::CONFIG_ID mapping
     *
     * @param $map
     * @throws \common_ext_ExtensionException
     */
    protected function setMap($map)
    {
        \common_ext_ExtensionsManager::singleton()->getExtensionById('qtiItemPci')->setConfig(self::CONFIG_ID, $map);
    }

    /**
     * Get the fly filesystem based on OPTION_FS configuration
     *
     * @return Filesystem
     */
    protected function getFileSystem()
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
    protected function getPrefix(PciModel $pciModel)
    {
        return md5($pciModel->getTypeIdentifier() . $pciModel->getVersion()) . DIRECTORY_SEPARATOR;
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
    protected function registerFiles(PciModel $pciModel, $files)
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

            $fileId = $this->getPrefix($pciModel) . $file;
            if ($fileSystem->has($fileId)) {
                $registered = $fileSystem->updateStream($fileId, $resource);
            } else {
                $registered = $fileSystem->writeStream($fileId, $resource);
            }
            fclose($resource);
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
    protected function unregisterFiles(PciModel $pciModel, $files)
    {
        $deleted = true;
        $filesystem = $this->getFileSystem();
        foreach ($files as $relPath) {
            $fileId = $this->getPrefix($pciModel) . $relPath;
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
    protected function getLatestVersion($typeIdentifier)
    {
        return $this->get($typeIdentifier);
    }

    /**
     * Check if PCI exists into self::CONFIG_ID mapping
     *
     * @param PciModel $pciModel
     * @return bool
     */
    public function exists(PciModel $pciModel)
    {
        $pcis = $this->getMap();

        if (empty($pcis) || !isset($pcis[$pciModel->getTypeIdentifier()])) {
            return false;
        }

        $version = $pciModel->getVersion();
        if (!$pciModel->hasVersion()) {
            $version = $this->getLatestVersion($pciModel->getTypeIdentifier());
        }

        if ($version!==null) {
            return (isset($pcis[$pciModel->getTypeIdentifier()][$version]));
        }

        return false;
    }

    /**
     * Get a PCI from identifier/version
     *
     * @param $identifier
     * @param null $version
     * @return $this|null
     */
    public function get($identifier, $version=null)
    {
        $pcis = $this->getMap();
        if (!isset($pcis[$identifier])) {
            return null;
        }

        $pciModel = new PciModel();
        $pci = $pcis[$identifier];
        if(is_null($version)){
            //return the latest version
            krsort($pci);
            return $pciModel->exchangeArray(reset($pci));
        }else{
            if (isset($pci[$version])) {
                return $pciModel->exchangeArray($pci[$version]);
            }else{
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
    public function retrieve(PciModel $pciModel)
    {
        return $this->get($pciModel->getTypeIdentifier(), $pciModel->getVersion());
    }

    /**
     * Register a PCI in a specific version
     *
     * @param PciModel $pciModel
     * @throws \common_Exception
     */
    public function register(PciModel $pciModel)
    {
        $latestVersion = $this->getLatestVersion($pciModel->getTypeIdentifier());
        if ($latestVersion) {
            if(version_compare($pciModel->getVersion(), $latestVersion->getVersion(), '<')){
                throw new \common_Exception('A newer version of the code already exists ' . $latestVersion->getVersion());
            }
        }

        $pcis = $this->getMap();
        $pcis[$pciModel->getTypeIdentifier()][$pciModel->getVersion()] = $pciModel->toArray();
        $this->setMap($pcis);

        $files = $this->getFilesFromPci($pciModel);
        $this->registerFiles($pciModel, $files);
    }

    /**
     *
     * @param PciModel $pciModel
     * @return array
     * @throws \common_Exception
     */
    protected function getFilesFromPci(PciModel $pciModel)
    {
        $validator = new PciModelValidator($pciModel);
        return $validator->getRequiredAssets();
    }

    /**
     * Return the absolute url of PCI storage
     *
     * @param $typeIdentifier
     * @param string $version
     * @return bool|string
     */
    protected function getBaseUrl($typeIdentifier, $version = null)
    {
        $pciModel = new PciModel($typeIdentifier, $version);
        if ($this->exists($pciModel)) {
            return $this->getFileUrl($typeIdentifier, $version, '');
        }
        return false;
    }

    /**
     * Unregister PCI by removing the given version data & asset files
     * If $pciModel doesn't have version, all versions will be removed
     *
     * @param PciModel $pciModel
     * @return bool
     * @throws \common_Exception
     */
    public function unregister(PciModel $pciModel)
    {
        if (!$this->exists($pciModel)) {
            throw new \InvalidArgumentException('Identifier "' . $pciModel->getTypeIdentifier() . '" to remove is not found in PCI map');
        }
        
        $this->removeAssets($pciModel);
        $this->removeMapPci($pciModel);
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
            $pciModel = $this->getLatestVersion($typeIdentifier);
            $pci = $this->getRuntime($typeIdentifier, $pciModel->getVersion());
            $all[$typeIdentifier] = [$pci];
        }
        return $all;
    }
    
    public function getLatestCreators()
    {
        $all = [];
        $pcis = array_keys($this->getMap());
        foreach ($pcis as $typeIdentifier) {
            $pciModel = $this->getLatestVersion($typeIdentifier);
            if(!empty($pciModel->getCreator())){
                $all[$typeIdentifier] = $pciModel;
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
    }

    /**
     * Remove a record in PCIs map by identifier
     *
     * @param PciModel $pciModel
     * @return bool
     * @throws \common_Exception
     */
    protected function removeMapPci(PciModel $pciModel)
    {
        $pcis = $this->getMap();
        if (isset($pcis[$pciModel->getTypeIdentifier()]) &&
            isset($pcis[$pciModel->getTypeIdentifier()][$pciModel->getVersion()])
        ) {
            unset($pcis[$pciModel->getTypeIdentifier()]);
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
    protected function getMapPci(PciModel $pciModel)
    {
        $pcis = $this->getMap();
        if (isset($pcis[$pciModel->getTypeIdentifier()])) {
            return $pcis[$pciModel->getTypeIdentifier()];
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
    protected function removeAssets(PciModel $pciModel)
    {
        $versions = $this->getMapPci($pciModel);
        if (!$versions) {
            return true;
        }
        foreach ($versions as $version => $files) {
            if (!$pciModel->hasVersion() || $version==$pciModel->getVersion()) {

                $hook        = (isset($files['hook']) && is_array($files['hook'])) ? $files['hook'] : [];
                $libs        = (isset($files['libs']) && is_array($files['libs'])) ? $files['libs'] : [];
                $stylesheets = (isset($files['stylesheets']) && is_array($files['stylesheets'])) ? $files['stylesheets'] : [];
                $mediaFiles  = (isset($files['mediaFiles']) && is_array($files['mediaFiles'])) ? $files['mediaFiles'] : [];

                $allFiles = array_merge($hook, $libs, $stylesheets, $mediaFiles);
                if (empty($allFiles)) {
                    continue;
                }
                if (!$this->unregisterFiles($pciModel, array_keys($allFiles))) {
                    throw new \common_Exception('Unable to delete asset files for PCI "' . $pciModel->getTypeIdentifier()
                        . '" at version "' . $pciModel->getVersion() . '"');
                }
            }
        }
        return true;
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

    /**
     * Return all file contents, following the same array format as the method getRuntime()
     * This method is useful to export registered PCI into standard QTI item packages
     *
     * @param $typeIdentifier
     * @param $version
     */
    public function export($typeIdentifier, $version){

    }
}