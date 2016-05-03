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

use oat\taoQtiItem\model\CreatorRegistry as ParentRegistry;
use \core_kernel_classes_Resource;
use \core_kernel_classes_Class;
use \core_kernel_classes_Property;
use \tao_models_classes_service_FileStorage;
use \common_ext_ExtensionsManager;
use \tao_helpers_Uri;
use oat\qtiItemPci\model\CreatorPackageParser;
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

    /**
     * @return Filesystem
     */
    protected function getFileSystem()
    {
        $fss = $this->getServiceLocator()->get(FileSystemService::SERVICE_ID);
        return $fss->getFileSystem($this->getOption(self::OPTION_FS));
    }

    /**
     * @return Websource
     */
    protected function getAccessProvider()
    {
        return WebsourceManager::singleton()->getWebsource($this->getOption(self::OPTION_WEBSOURCE));
    }

    protected function getPrefix($id, $version)
    {
        return md5($id.$version).'/';
    }


    protected function registerFiles($typeIdentifier, $version, $files)
    {
        $registered = false;
        $fs = $this->getFileSystem();
        foreach ($files as $relPath => $file) {
            if(file_exists($file)){
                $fileId = $this->getPrefix($typeIdentifier, $version).$relPath;
                $resource = fopen($file, 'r');
                if($fs->has($fileId)){
                    common_Logger::w('updated stream '.$typeIdentifier . ' '. $version.' '.$relPath);
                    $registered &= $fs->updateStream($fileId, $resource);
                }else{
                    $registered &= $fs->writeStream($fileId, $resource);
                }
            }else{
                throw new \common_Exception('file cannot be opened : ' . $file);
            }
        }
        return $registered;
    }

    protected function getFileUrl($typeIdentifier, $version, $relPath)
    {
        return $this->getAccessProvider()->getAccessUrl($this->getPrefix($typeIdentifier, $version).$relPath);
    }
    
    protected function getFileContent($id, $version, $file){
        
    }
    
    protected function unregisterFiles($id, $version, $files){
        $deleted = false;
        $fs = $this->getFileSystem();
        foreach ($files as $relPath) {
            $fileId = $this->getPrefix($id, $version).$relPath;
            if($fs->has($fileId)){
                $deleted &= $fs->delete($fileId);
            }else{
                throw new \common_Exception('File does not exists in the filesystem : ' . $relPath);
            }
        }
        return $deleted;
    }
    
    protected function getMap(){
        return \common_ext_ExtensionsManager::singleton()->getExtensionById('qtiItemPci')->getConfig(self::CONFIG_ID);
    }
    
    protected function setMap($map){
        \common_ext_ExtensionsManager::singleton()->getExtensionById('qtiItemPci')->setConfig(self::CONFIG_ID, $map);
    }
    
    public function getLatestVersion($typeIdentifier){
        $pcis = $this->getMap();
        if(isset($pcis[$typeIdentifier])){
            $pci = $pcis[$typeIdentifier];
            end($pci);
            return key($pci);
        }
        return null;
    }
    
    public function exists($typeIdentifier, $version = ''){
        $pcis = $this->getMap();
        if(isset($pcis[$typeIdentifier])){
            if(empty($version)){
                $version = $this->getLatestVersion($typeIdentifier);
            }
            if(!empty($version)){
                return (isset($pcis[$typeIdentifier][$version]));
            }
        }else{
            throw new \common_Exception('the pci does not exist '.$typeIdentifier);
        }
    }
    
    public function register($typeIdentifier, $targetVersion, $hook = [], $libs = [], $stylesheets = [], $mediaFiles = [], $creator = []){
        
        $pcis = $this->getMap();
        
        if(isset($pcis[$typeIdentifier])){
            //check version:
            $latest = $this->getLatestVersion($typeIdentifier);
            if(version_compare($targetVersion, $latest, '<')){
                throw new \common_Exception('A newer version of the code already exists '.$latest);
            }
        }else{
            $pcis[$typeIdentifier] = [];
        }
        
        $pcis[$typeIdentifier][$targetVersion] = [
            'hook' => $hook,
            'libs' => $libs,
            'stylesheets' => $stylesheets,
            'mediaFiles' => $mediaFiles,
            'creator' => $creator
        ];
        
        $files = array_merge($hook, $libs, $stylesheets, $mediaFiles);
        $this->registerFiles($typeIdentifier, $targetVersion, $files);
        
        $this->setMap($pcis);
    }
    
    public function getBaseUrl($typeIdentifier, $version = ''){
        if($this->exists($typeIdentifier, $version)){
            return $this->getFileUrl($typeIdentifier, $version, '');
        }
        return false;
    }
    
    public function unregister($typeIdentifier, $version){
        
    }
    
    public function export($typeIdentifier, $version){
        
    }
    
    public function getRuntime($typeIdentifier, $version = ''){
        $pcis = $this->getMap();
        if(isset($pcis[$typeIdentifier])){
            if(empty($version)){
                $version = $this->getLatestVersion($typeIdentifier);
            }
            if($pcis[$typeIdentifier][$version]){
                $pci =  $pcis[$typeIdentifier][$version];
                $pci['version'] = $version;
                $pci['runtimeLocation'] = $this->getBaseUrl($typeIdentifier, $version);
                foreach($pci['hook'] as $relPath => $file){
                    $pci['hook'][$relPath] = $this->getFileUrl($typeIdentifier, $version, $relPath);
                }
                foreach($pci['libs'] as $relPath => $file){
                    $pci['libs'][$relPath] = $this->getFileUrl($typeIdentifier, $version, $relPath);
                }
                foreach($pci['stylesheets'] as $relPath => $file){
                    $pci['stylesheets'][$relPath] = $this->getFileUrl($typeIdentifier, $version, $relPath);
                }
                foreach($pci['mediaFiles'] as $relPath => $file){
                    $pci['mediaFiles'][$relPath] = $this->getFileUrl($typeIdentifier, $version, $relPath);
                }
                return $pci;
            }else{
                throw new \common_Exception('The pci does not exist in the requested version : '.$typeIdentifier.' '.$version);
            }
        }else{
            throw new \common_Exception('The pci does not exist : '.$typeIdentifier);
        }
    }
    
    public function getCreator($typeIdentifier, $version = ''){
        $pcis = $this->getMap();
        if(isset($pcis[$typeIdentifier])){
            if(empty($version)){
                $version = $this->getLatestVersion($typeIdentifier);
            }
            if($pcis[$typeIdentifier][$version]){
                $pci =  $pcis[$typeIdentifier][$version];
                $pci['version'] = $version;
                $pci['typeIdentifier'] = $typeIdentifier;
                $pci['baseUrl'] = $this->getBaseUrl($typeIdentifier, $version);
                $pci['label'] = $this->getBaseUrl($typeIdentifier, $version);
                $pci['manifest'] = $this->getBaseUrl($typeIdentifier, $version);
                $pci['file'] = $this->getFileUrl($typeIdentifier, $version, 'pciCreator.js');
                return $pci;
            }else{
                throw new \common_Exception('The pci does not exist in the requested version : '.$typeIdentifier.' '.$version);
            }
        }else{
            throw new \common_Exception('The pci does not exist : '.$typeIdentifier);
        }
    }
    
    public function getLatestRuntime(){
        $all = [];
        $pcis = $this->getMap();
        foreach($pcis as $typeIdentifier => $versions){
            $version = $this->getLatestVersion($typeIdentifier);
            $pci = $this->getRuntime($typeIdentifier, $version);
            $all[$typeIdentifier] = [$version => $pci];
        }
        return $all;
    }
    
    public function unregisterAll(){
        $pcis = $this->getMap();
        foreach($pcis as $typeIdentifier => $versions){
            foreach($versions as $version => $files){
                $allFiles = array_merge($files['hook'], $files['libs'], $files['stylesheets'], $files['mediaFiles']);
                $this->unregisterFiles($typeIdentifier, $version, array_keys($allFiles));
            }
        }
        $this->setMap([]);
    }
}