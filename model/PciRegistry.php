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
    
    const CONFIG_ID = 'pciRegistry';

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


    protected function registerFile($id, $version, $files)
    {
        $fs = $this->getFileSystem();
        foreach ($files as $relPath => $content) {
            $fs->writeStream($this->getPrefix($id, $version).$relPath, $content);
        }
    }

    protected function getFileUrl($id, $version, $file)
    {
        $this->getAccessProvider()->getAccessUrl($this->getPrefix($id, $version).$file);
    }
    
    protected function getFileContent($id, $version, $file){
        
    }
    
    protected function removeFile($id, $version, $file){
        
    }
    
    protected function getMap(){
        return \common_ext_ExtensionsManager::singleton()->getExtensionById('qtiItemPci')->getConfig(self::CONFIG_ID);
    }
    
    protected function setMap($map){
        var_dump($map);
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
    
    public function exists($typeIdentifier, $version = null){
        $pcis = $this->getMap();
        if(isset($pcis[$typeIdentifier])){
            return (isset($pcis[$typeIdentifier][$version]));
        }else{
            throw new \common_Exception('the pci does not exist '.$typeIdentifier);
        }
    }
    
    public function register($typeIdentifier, $targetVersion, $hook = [], $libs = [], $stylesheets = [], $mediaFiles = []){
        
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
            'mediaFiles' => $mediaFiles
        ];
        
//        $files = array_merge($hook, $libs, $stylesheets, $mediaFiles);
//        $this->registerFile($typeIdentifier, $targetVersion, $files);
        
        $this->setMap($pcis);
    }
    
    public function getRuntimeLocation($typeIdentifier, $targetVersion = ''){
        $baseUrl = $pciRegistry->getPciUrl($typeIdentifier, $targetVersion, '');
    }
    
    public function unregister($typeIdentifier, $targetVersion){
        
    }
    
    public function export($typeIdentifier, $targetVersion){
        
    }
    
    public function getAll(){
        
    }
    
    public function unregisterAll(){
        $this->setMap([]);
    }
}