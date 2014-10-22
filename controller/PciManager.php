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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\qtiItemPci\controller;

use \core_kernel_classes_Resource;
use \tao_actions_CommonModule;
use \common_exception_Error;
use \tao_helpers_File;
use \tao_helpers_Http;
use \FileUploadException;
use oat\taoQtiItem\model\qti\Service;
use oat\qtiItemPci\model\CreatorRegistry;
use oat\qtiItemPci\model\CreatorPackageParser;
use oat\taoQtiItem\helpers\Authoring;

class PciManager extends tao_actions_CommonModule
{
    
    /**
     * Instanciate the controller
     */
    public function __construct(){
        parent::__construct();
        $this->registry = CreatorRegistry::singleton();
    }

    /**
     * Returns the list of registered custom interactions and their data
     */
    public function getRegisteredInteractions(){

        $returnValue = array();

        $all = $this->registry->getRegisteredInteractions();

        foreach($all as $pci){
            $returnValue[$pci['typeIdentifier']] = $this->filterInteractionData($pci);
        }

        $this->returnJson($returnValue);
    }
    
    /**
     * Remove security sensitive data to be sent to the client
     * 
     * @param array $rawInteractionData
     * @return array
     */
    protected function filterInteractionData($rawInteractionData){
        
        unset($rawInteractionData['directory']);
        return $rawInteractionData;
    }

    /**
     * Service to check if the uploaded file archive is a valid and non-existing one
     * 
     * JSON structure:
     * {
     *     "valid" : true/false (if is a valid package) 
     *     "exists" : true/false (if the package is valid, check if the typeIdentifier is already used in the registry)
     * }
     */
    public function verify(){

        $result = array(
            'valid' => false,
            'exists' => false
        );

        $file = tao_helpers_Http::getUploadedFile('content');

        $creatorPackageParser = new CreatorPackageParser($file['tmp_name']);
        $creatorPackageParser->validate();
        if($creatorPackageParser->isValid()){

            $result['valid'] = true;

            $manifest = $creatorPackageParser->getManifest();

            $result['typeIdentifier'] = $manifest['typeIdentifier'];
            $result['label'] = $manifest['label'];
            $interaction = $this->registry->get($manifest['typeIdentifier']);
            
            if(!is_null($interaction)){
                $result['exists'] = true;
            }
        }else{
            $result['package'] = $creatorPackageParser->getErrors();
        }

        $this->returnJson($result);
    }
    
    /**
     * Add a new custom interaction from the uploaded zip package
     */
    public function add(){

        //as upload may be called multiple times, we remove the session lock as soon as possible
        session_write_close();

        try{
            $replace= true; //always set as "replaceable" and delegate decision to replace or not to the client side
            $file = tao_helpers_Http::getUploadedFile('content');
            $newInteraction = $this->registry->add($file['tmp_name'], $replace);

            $this->returnJson($this->filterInteractionData($newInteraction));
            
        }catch(FileUploadException $fe){

            $this->returnJson(array('error' => $fe->getMessage()));
        }
    }
    
    /**
     * Delete a custom interaction from the registry
     */
    public function delete(){

        $typeIdentifier = $this->getRequestParameter('typeIdentifier');
        $this->registry->remove($typeIdentifier);
        $ok = true;

        $this->returnJson(array(
            'success' => $ok
        ));
    }
    
    /**
     * Get a file of a custom interaction
     */
    public function getFile(){

        if($this->hasRequestParameter('file')){
            $file = urldecode($this->getRequestParameter('file'));
            $filePathTokens = explode('/', $file);
            $pciTypeIdentifier = array_shift($filePathTokens);
            $relPath = implode(DIRECTORY_SEPARATOR, $filePathTokens);
            $this->renderFile($pciTypeIdentifier, $relPath);
        }
    }
    
    /**
     * Render the file to the browser
     * 
     * @param string $typeIdentifier
     * @param string $relPath
     * @throws common_exception_Error
     */
    private function renderFile($typeIdentifier, $relPath){

        $pci = $this->registry->get($typeIdentifier);
        if(is_null($pci)){
            $folder = $this->registry->getDevInteractionDirectory($typeIdentifier);
        }else{
            $folder = $pci['directory'];
        }

        if(tao_helpers_File::securityCheck($relPath, true)){
            $filename = $folder.$relPath;
            //@todo : find better way to to this
            //load amd module
            if(!file_exists($filename) && file_exists($filename.'.js')){
                $filename = $filename.'.js';
            }
            tao_helpers_Http::returnFile($filename);
        }else{
            throw new common_exception_Error('invalid item preview file path');
        }
    }
    
    /**
     * Add required resources for a custom interaction (css, js) in the item directory
     * 
     * @throws common_exception_Error
     */
    public function addRequiredResources(){
        
        //get params
        $typeIdentifier = $this->getRequestParameter('typeIdentifier');
        $itemUri = urldecode($this->getRequestParameter('uri'));
        $item = new core_kernel_classes_Resource($itemUri);
        $sharedLibRegistry = Service::singleton()->getSharedLibrariesRegistry();
        
        //find the interaction in the registry
        $interaction = $this->registry->get($typeIdentifier);
        if(is_null($interaction)){
            $interaction = $this->registry->getDevInteraction($typeIdentifier);
        }
        if(is_null($interaction)){
            throw new common_exception_Error('no pci found with the type identifier '.$typeIdentifier);
        }
        
        //get the root directory of the interaction
        $directory = $interaction['directory'];
        
        //get the lists of all required resources
        $manifest = $interaction['manifest'];
        $required = array($manifest['entryPoint']);
        
        //include libraries remotely only, so this block is temporarily disabled
        foreach($manifest['libraries'] as $lib){
            if(!$sharedLibRegistry->isRegistered($lib)){
                $lib = preg_replace('/^.\//', '', $lib);
//                $lib = $typeIdentifier . '/' . $lib; //add interaction namespace
                $lib .= '.js';//add js extension
                $required[] = $lib;
            }
        }
        
        //include custom interaction specific css in the item
        if(isset($manifest['css'])){
            $required = array_merge($required, array_values($manifest['css']));
        }
        
        //include media in the item
        if(isset($manifest['media'])){
            $required = array_merge($required, array_values($manifest['media']));
        }
        
        //add them to the rdf item
        $resources = Authoring::addRequiredResources($directory, $required, $typeIdentifier, $item, '');
        
        $this->returnJson(array(
            'success' => true,
            'resources' => $resources
        ));
    }

}