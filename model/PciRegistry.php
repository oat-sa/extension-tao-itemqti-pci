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

/**
 * CreatorRegistry stores reference to
 *
 * @package qtiItemPci
 */
class PciRegistry extends ConfigurableService
{
    const SERVICE_ID = 'qtiItemPci\pciRegistry';

    const OPTION_FILESYSTEM = 'filesystem';

    const OPTION_WEBSOURCE = 'websource';
    
    const CONFIG_ID = 'pciRegistry';

    /**
     * @return Filesystem
     */
    protected function getFileSystem()
    {

    }

    /**
     * @return Websource
     */
    protected function getAccessProvider()
    {

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
    
    protected function getFileContent(){
        
    }
    
    protected function getMap(){
        return $this->getExtension()->getConfig(self::CONFIG_ID);
    }
    
    protected function setMap($map){
        $this->getExtension()->setConfig(self::CONFIG_ID, $map);
    }


    public function register($typeIdentifier, $targetVersion, $hook = [], $libs = [], $stylesheets = [], $mediaFiles = []){
        
        $pcis = $this->getMap();
        
        if(isset($config[$typeIdentifier])){
            //check version:
        }else{
            $config[$typeIdentifier] = [];
        }
        
        $config[$typeIdentifier][$targetVersion] = [
            'hook' => $hook,
            'libs' => $libs,
            'stylesheets' => $stylesheets,
            'mediaFiles' => $mediaFiles
        ];
        
        $this->setMap($pcis);
    }
    
    public function update($typeIdentifier, $sourceVersion, $targetVersion, $hook = '', $libs = [], $stylesheets = [], $mediaFiles = []){
        
    }
    
    public function getRuntimeLocation($typeIdentifier, $targetVersion){
        
    }
    
    public function remove($typeIdentifier, $targetVersion){
        
    }
    
    public function export($typeIdentifier, $targetVersion){
        
    }
    
    public function getAll(){
        
    }
    
    public function removeAll(){
        $this->setMap([]);
    }
}



$files = array(
    'a.js' => './tmp/mycontent',
    'img/a.img' => './tmp/stuff'
);

$pciRegistry = new PciRegistry();
$pciRegistry->registerPci('superPci', $files);



$baseUrl = $pciRegistry->getPciUrl('superPci', '');