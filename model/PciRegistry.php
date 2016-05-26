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
use oat\tao\model\websource\Websource;
use League\Flysystem\Filesystem;
use oat\oatbox\filesystem\FileSystemService;
use oat\tao\model\websource\WebsourceManager;
use common_Logger;

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

    protected $temporaryLocation;

    /**
     * Return all PCI from self::CONFIG_ID mapping
     *
     * @return array
     * @throws \common_ext_ExtensionException
     */
    protected function getMap(){
        return \common_ext_ExtensionsManager::singleton()->getExtensionById('qtiItemPci')->getConfig(self::CONFIG_ID);
    }

    /**
     * Delete all PCI from self::CONFIG_ID mapping
     *
     * @param $map
     * @throws \common_ext_ExtensionException
     */
    protected function setMap($map){
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
     * @param $typeIdentifier
     * @param $version
     * @param $relPath
     * @return string
     */
    protected function getFileUrl($typeIdentifier, $version, $relPath)
    {
        return $this->getAccessProvider()->getAccessUrl($this->getPrefix($typeIdentifier, $version) . $relPath);
    }

    /**
     * Transform couple of $id, $version to key
     *
     * @param $id
     * @param $version
     * @return string
     */
    protected function getPrefix($id, $version)
    {
        return md5($id.$version) . DIRECTORY_SEPARATOR;
    }

    /**
     * Set the temporary temp dir where extracted zip is located
     * @param $tmp
     * @return $this
     * @throws \common_Exception
     */
    public function setTempDirectory($tmp)
    {
        if (!is_dir($tmp)) {
            throw new \common_Exception('Unable to locate temp directory');
        }
        $this->temporaryLocation = DIRECTORY_SEPARATOR . trim($tmp, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        return $this;
    }

    /**
     * Register files associated to a PCI track by $typeIdentifier
     *
     * @todo If first is not ok, second is, return will be true
     * @param $typeIdentifier
     * @param $version
     * @param $files
     * @return bool
     * @throws \common_Exception
     */
    protected function registerFiles($typeIdentifier, $version, $files)
    {
        $registered = false;
        $fileSystem = $this->getFileSystem();

        $temp = $this->temporaryLocation;
        if (!$temp) {
            throw new \common_Exception('Temp directory is not correctly set.');
        }

        foreach ($files as $file) {
            if (substr($file, 0, 2)!='./') {
                // File is not relative, it's a shared libraries
                // Ignore this file, front have fallBack
                continue;
            }

            $filePath = $temp . $file;
            if (!file_exists($filePath) || ($resource = fopen($filePath, 'r'))===false) {
                throw new \common_Exception('File cannot be opened : ' . $filePath);
            }

            $fileId = $this->getPrefix($typeIdentifier, $version) . $file;
            if ($fileSystem->has($fileId)) {
                common_Logger::w('updated stream '.$typeIdentifier . ' '. $version.' '.$filePath);
                $registered = $fileSystem->updateStream($fileId, $resource);
            } else {
                $registered = $fileSystem->writeStream($fileId, $resource);
            }
            fclose($resource);
        }
        return $registered;
    }

    /**
     * Unregister a file by removing it from FileSystem
     *
     * @todo If first is not ok, second is, return will be true
     * @param $id
     * @param $version
     * @param $files
     * @return bool
     * @throws \common_Exception
     */
    protected function unregisterFiles($id, $version, $files)
    {
        $deleted = false;
        $filesystem = $this->getFileSystem();
        foreach ($files as $relPath) {
            $fileId = $this->getPrefix($id, $version) . $relPath;
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
        $pcis = $this->getMap();
        if(isset($pcis[$typeIdentifier])){
            $pci = $pcis[$typeIdentifier];
            end($pci);
            return key($pci);
        }
        return null;
    }

    /**
     * Check if PCI exists into self::CONFIG_ID mapping
     *
     * @todo check return in case of no version from latestVersion
     * @param $typeIdentifier
     * @param string $version
     * @return bool
     */
    public function exists($typeIdentifier, $version=null)
    {
        $pcis = $this->getMap();

        if (!isset($pcis[$typeIdentifier])) {
            return false;
        }

        if ($version===null) {
            $version = $this->getLatestVersion($typeIdentifier);
        }

        if ($version!==null) {
            return (isset($pcis[$typeIdentifier][$version]));
        }

        return false;
    }
    
    /**
     * Register a PCI in a specific version
     *
     * @param string $typeIdentifier
     * @param string $targetVersion
     * @param array $runtime
     * @param array $creator
     * @throws \common_Exception
     */
    public function register($typeIdentifier, $targetVersion, $runtime, $creator = [])
    {
        $pcis = $this->getMap();
        
        if (isset($pcis[$typeIdentifier])) {
            $latest = $this->getLatestVersion($typeIdentifier);
            if(version_compare($targetVersion, $latest, '<')){
                throw new \common_Exception('A newer version of the code already exists '.$latest);
            }
        } else {
            $pcis[$typeIdentifier] = [];
        }

        $files = [];

        //@todo improve validation
        if (!isset($runtime['hook'])) {
            throw new \common_Exception('missing runtime hook file');
        }

        $libraries   = (isset($runtime['libraries']) && is_array($runtime['libraries'])) ? $runtime['libraries'] : [];
        $stylesheets = (isset($runtime['stylesheets']) && is_array($runtime['stylesheets'])) ? $runtime['stylesheets'] : [];
        $mediaFiles  = (isset($runtime['mediaFiles']) && is_array($runtime['mediaFiles'])) ? $runtime['mediaFiles'] : [];

        array_push($files, $runtime['hook']);
        $files = array_merge($files, $libraries, $stylesheets, $mediaFiles);
        
        $pci = [
            'runtime' => [
                'hook' => $runtime['hook'],
                'libraries'   => $libraries,
                'stylesheets' => $stylesheets,
                'mediaFiles'  => $mediaFiles
            ]
        ];
        
        if (!empty($creator)) {
            //a creator hook is being registered
            
            //@todo improve validation
            if(!isset($creator['icon'])){
                throw new \common_Exception('Missing icon file');
            }
            if(!isset($creator['hook'])){
                throw new \common_Exception('Missing creator hook file');
            }
            if(!isset($creator['manifest'])){
                throw new \common_Exception('Missing manifest file');
            }
            if(!isset($creator['libraries'])){
                throw new \common_Exception('Missing libraries');
            }

            $creator_libs        = (isset($creator['libs']) && is_array($creator['libs'])) ? $creator['libs'] : [];
            $creator_stylesheets = (isset($creator['stylesheets']) && is_array($creator['stylesheets'])) ? $creator['stylesheets'] : [];
            $creator_mediaFiles  = (isset($creator['mediaFiles']) && is_array($creator['mediaFiles'])) ? $creator['mediaFiles'] : [];

            $files['icon']     = $creator['icon'];
            $files['hook']     = $creator['hook'];
            $files['manifest'] = $creator['manifest'];

            $files = array_merge($files, $creator_libs, $creator_stylesheets, $creator_mediaFiles);

            $pci['creator'] = [
                'icon'        => $creator['icon'],
                'manifest'    => $creator['manifest'],
                'hook'        => $creator['hook'],
                'libraries'   => $creator_libs,
                'stylesheets' => $creator_stylesheets,
                'mediaFiles'  => $creator_mediaFiles
            ];
        }
        
        $pcis[$typeIdentifier][$targetVersion] = $pci;
        $this->registerFiles($typeIdentifier, $targetVersion, $files);
        $this->setMap($pcis);
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
     * Return the absolute url of PCI storage
     *
     * @param $typeIdentifier
     * @param string $version
     * @return bool|string
     */
    protected function getBaseUrl($typeIdentifier, $version = '')
    {
        if ($this->exists($typeIdentifier, $version)) {
            return $this->getFileUrl($typeIdentifier, $version, '');
        }
        return false;
    }

    /**
     * Unregister PCI by removing the given version data & asset files
     * If version is not given, all versions will be removed
     *
     * @param $typeIdentifier
     * @param null $version
     * @return bool
     * @throws \common_Exception
     */
    public function unregister($typeIdentifier, $version=null)
    {
        $pcis = $this->getMap();

        if (!isset($pcis[$typeIdentifier])) {
            throw new \InvalidArgumentException('Identifier "' . $typeIdentifier . '" to remove is not found in PCI map');
        }

        //Remove all asset files
        $this->removeAssets($typeIdentifier, $pcis[$typeIdentifier], $version);
        //Remove PCI itself
        unset($pcis[$typeIdentifier]);

        $this->setMap($pcis);
        return true;
    }
    
    /**
     * Return all file contents, following the same array format as the method getRuntime()
     * This method is useful to export registered PCI into standard QTI item packages
     * 
     * @todo
     * @param type $typeIdentifier
     * @param type $version
     */
    public function export($typeIdentifier, $version){
        
    }
    
    protected function getRuntime($typeIdentifier, $version = '')
    {
        $pcis = $this->getMap();
        if (isset($pcis[$typeIdentifier])) {
            if (empty($version)) {
                $version = $this->getLatestVersion($typeIdentifier);
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

    protected function addPathPrefix($typeIdentifier, $var)
    {
        common_Logger::e($var);
        if (is_string($var)) {
            return $typeIdentifier.'/'.$var;
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
    public function getLatestRuntime()
    {
        $all = [];
        $pcis = $this->getMap();
        foreach ($pcis as $typeIdentifier => $versions) {
            $version = $this->getLatestVersion($typeIdentifier);
            $pci = $this->getRuntime($typeIdentifier, $version);
            $all[$typeIdentifier] = [$pci];
        }
        return $all;
    }
    
    /**
     * Unregister all previously registered pci, in all version
     */
    public function unregisterAll()
    {
        $pcis = $this->getMap();
        foreach($pcis as $typeIdentifier => $versions){
            $this->removeAssets($typeIdentifier, $versions);
        }
        $this->setMap([]);
    }

    /**
     * Remove all registered files for a PCI identifier from FileSystem
     * If $targetedVersion is given, remove only assets for this version
     *
     * @param $identifier
     * @param $versions
     * @param $targetedVersion
     * @return bool
     * @throws \common_Exception
     */
    protected function removeAssets($identifier, $versions, $targetedVersion=null)
    {
        foreach ($versions as $version => $files) {
            if (!$targetedVersion || $version==$targetedVersion) {

                $hook        = (isset($files['hook']) && is_array($files['hook'])) ? $files['hook'] : [];
                $libs        = (isset($files['libs']) && is_array($files['libs'])) ? $files['libs'] : [];
                $stylesheets = (isset($files['stylesheets']) && is_array($files['stylesheets'])) ? $files['stylesheets'] : [];
                $mediaFiles  = (isset($files['mediaFiles']) && is_array($files['mediaFiles'])) ? $files['mediaFiles'] : [];

                $allFiles = array_merge($hook, $libs, $stylesheets, $mediaFiles);
                if (!$this->unregisterFiles($identifier, $version, array_keys($allFiles))) {
                    throw new \common_Exception('Unable to delete asset files for PCI "' . $identifier
                        . '" at version "' . $version . '"');
                }
            }
        }
        return true;
    }

    /**
     * Get PCI data from self::CONFIG_ID mapping
     * Identifier for the key of maps & version
     * If version is null, latest is took under consideration
     *
     * @param $typeIdentifier
     * @param null $version
     * @return mixed
     * @throws \common_Exception
     */
    public function get($typeIdentifier, $version=null)
    {
        if ($version===null) {
            $version = $this->getLatestVersion($typeIdentifier);
        }

        if (!$this->exists($typeIdentifier, $version)) {
            throw new \common_Exception('Unable to find PCI identifier "' . $typeIdentifier .
                '" at version "' . $version. '"');
        }

        $pcis = $this->getMap();
        return $pcis[$typeIdentifier][$version];
    }
}