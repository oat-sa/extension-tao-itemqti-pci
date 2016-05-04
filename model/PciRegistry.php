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

    /**
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
        //var_dump($files);
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
    
    /**
     * Get the registered file for a pci in a specific version
     * 
     * @todo
     * @param string $typeIdentifier
     * @param string $version
     * @param string $file - file path
     */
    protected function getFileContent($typeIdentifier, $version, $file)
    {

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

    /**
     * Check if file exists
     * @param $typeIdentifier
     * @param string $version
     * @return bool
     */
    public function exists($typeIdentifier, $version = '')
    {
        $pcis = $this->getMap();

        if (!isset($pcis[$typeIdentifier])) {
            return false;
        }

        if(empty($version)){
            $version = $this->getLatestVersion($typeIdentifier);
        }

        if(!empty($version)){
            return (isset($pcis[$typeIdentifier][$version]));
        }
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
    public function register($typeIdentifier, $targetVersion, $runtime, $creator = []){
        
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
        
        //@todo improve validation
        if(!isset($runtime['hook'])){
            throw new \common_Exception('missing runtime hook file');
        }
        
        $files = array_merge($runtime['hook'], $runtime['libraries'], $runtime['stylesheets'], $runtime['mediaFiles']);
        
        $pci = [
            'runtime' => [
                'hook' => array_keys($runtime['hook'])[0],
                'libraries' => isset($runtime['libraries']) ? array_keys($runtime['libraries']) : [],
                'stylesheets' => isset($runtime['stylesheets']) ? array_keys($runtime['stylesheets']) : [],
                'mediaFiles' => isset($runtime['mediaFiles']) ? array_keys($runtime['mediaFiles']) : [],
            ]
        ];
        
        if(!empty($creator)){
            //a creator hook is being registered
            
            //@todo improve validation
            if(!isset($creator['icon'])){
                throw new \common_Exception('missing icon file');
            }
            if(!isset($creator['hook'])){
                throw new \common_Exception('missing creator hook file');
            }
            if(!isset($creator['manifest'])){
                throw new \common_Exception('missing manifest file');
            }
            if(!isset($creator['libraries'])){
                throw new \common_Exception('missing libraries');
            }
            $pci['creator'] = [
                'icon' => array_keys($creator['icon'])[0],
                'manifest' => array_keys($creator['manifest'])[0],
                'hook' => array_keys($creator['hook'])[0],
                'libraries' => array_keys($creator['libraries']),
                'stylesheets' => isset($creator['stylesheets']) ? array_keys($creator['stylesheets']) : [],
                'mediaFiles' => isset($creator['mediaFiles']) ? array_keys($creator['mediaFiles']) : [],
            ];
            
            $files = array_merge($files, $creator['icon'], $creator['hook'], $creator['manifest'], $creator['libraries']);
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
    
    public function getBaseUrl($typeIdentifier, $version = ''){
        if($this->exists($typeIdentifier, $version)){
            return $this->getFileUrl($typeIdentifier, $version, '');
        }
        return false;
    }
    
    /**
     * Unregsiter a single pci.
     * If the version is '*', all pci version will be unregistered
     * 
     * @todo
     */
    public function unregister($typeIdentifier, $version = '*'){

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
    
    public function getRuntime($typeIdentifier, $version = ''){
        $pcis = $this->getMap();
        if(isset($pcis[$typeIdentifier])){
            if(empty($version)){
                $version = $this->getLatestVersion($typeIdentifier);
            }
            if($pcis[$typeIdentifier][$version]){
                $pci = $this->addPathPrefix($typeIdentifier, $pcis[$typeIdentifier][$version]);
                $pci['version'] = $version;
                $pci['baseUrl'] = $this->getBaseUrl($typeIdentifier, $version);
                return $pci;
            }else{
                throw new \common_Exception('The pci does not exist in the requested version : '.$typeIdentifier.' '.$version);
            }
        }else{
            throw new \common_Exception('The pci does not exist : '.$typeIdentifier);
        }
    }
    
    protected function addPathPrefix($typeIdentifier, $var){
        if(is_string($var)){
            return $typeIdentifier.'/'.$var;
        }else if(is_array($var)){
            foreach($var as $k => $v){
                $var[$k] = $this->addPathPrefix($typeIdentifier, $v);
            }
            return $var;
        }else{
            throw new \InvalidArgumentException('$var must be a string or an array');
        }
    }
    
    public function getLatestRuntime(){
        $all = [];
        $pcis = $this->getMap();
        foreach($pcis as $typeIdentifier => $versions){
            $version = $this->getLatestVersion($typeIdentifier);
            $pci = $this->getRuntime($typeIdentifier, $version);
            $all[$typeIdentifier] = [$pci];
        }
        return $all;
    }
    
    /**
     * Unregsiter all previously registered pci, in all version
     */
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

    /**
     * Remove a registered interaction from the registry
     *
     * @param string $typeIdentifier
     */
    public function remove($typeIdentifier){

        $hook = $this->getResource($typeIdentifier);
        if($hook){
            $hook->delete();
            //@todo : remove the directory too!
        }
    }
}