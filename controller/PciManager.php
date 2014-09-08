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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

namespace oat\qtiItemPci\controller;

use \tao_actions_CommonModule;
use \common_ext_ExtensionsManager;
use \common_exception_Error;
use \tao_helpers_File;
use \tao_helpers_Http;
use oat\qtiItemPci\model\CreatorRegistry;

class PciManager extends tao_actions_CommonModule
{
    
    public function getRegisteredInteractions(){
        
        $returnValue = array();
        
        $registry = CreatorRegistry::singleton();
        $all = $registry->getRegisteredInteractions();
        
        foreach($all as $pci){
            $returnValue[] = array(
                'typeIdentifier' => $pci['typeIdentifier'],
                'label' => $pci['label']
            );
        }
        
        $this->returnJson($returnValue);
    }
    
    public function delete(){
        
        $typeIdentifier = $this->getRequestParameter('typeIdentifier');
        $registry = CreatorRegistry::singleton();
        $registry->remove($typeIdentifier);
        $ok = true;
        
        $this->returnJson(array(
            'success' => $ok
        ));
    }
    
    public function getFile(){

        if($this->hasRequestParameter('file')){
            $file = urldecode($this->getRequestParameter('file'));
            $filePathTokens = explode('/', $file);
            $pciTypeIdentifier = array_shift($filePathTokens);
            $relPath = implode(DIRECTORY_SEPARATOR, $filePathTokens);
            $this->renderFile($pciTypeIdentifier, $relPath);
        }
    }

    private function renderFile($pciTypeIdentifier, $relPath){
        
        $registry = CreatorRegistry::singleton();
        $pci = $registry->get($pciTypeIdentifier);
        if(is_null($pci)){
            $base = common_ext_ExtensionsManager::singleton()->getExtensionById('qtiItemPci')->getConstant('DIR_VIEWS');
            $folder = $base . 'js' . DIRECTORY_SEPARATOR . 'pciCreator' . DIRECTORY_SEPARATOR . $pciTypeIdentifier . DIRECTORY_SEPARATOR;
            echo '/*source from views/js/pciCreator*/'.PHP_EOL;
        }else{
            $folder = $pci['directory'];
        }
        
        if(tao_helpers_File::securityCheck($relPath, true)){
            $filename = $folder.$relPath;
            tao_helpers_Http::returnFile($filename);
        }else{
            throw new common_exception_Error('invalid item preview file path');
        }
    }

}   
