<?php
/*
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

namespace oat\qtiItemPci\model;

use \core_kernel_classes_Resource;
use \core_kernel_classes_Class;
use \core_kernel_classes_Property;
use \tao_models_classes_service_FileStorage;
use \common_ext_ExtensionsManager;
use \tao_helpers_Uri;
use oat\qtiItemPci\model\CreatorPackageParser;

/**
 * The hook used in the item creator
 *
 * @package qtiItemPci
 */
class CreatorRegistry
{

    /**
     * @var tao_models_classes_service_FileStorage
     */
    private static $instance;

    /**
     * @return tao_models_classes_service_FileStorage
     */
    public static function singleton(){

        if(is_null(self::$instance)){
            self::$instance = new self();
        }

        return self::$instance;
    }

    protected function __construct(){

        $this->registryClass = new core_kernel_classes_Class('http://www.tao.lu/Ontologies/QtiItemPci.rdf#PciCreatorHook');
        $this->storage = tao_models_classes_service_FileStorage::singleton();
        $this->propTypeIdentifier = new core_kernel_classes_Property('http://www.tao.lu/Ontologies/QtiItemPci.rdf#PciCreatorIdentifier');
        $this->propDirectory = new core_kernel_classes_Property('http://www.tao.lu/Ontologies/QtiItemPci.rdf#PciCreatorDirectory');
        
        $extension = common_ext_ExtensionsManager::singleton()->getExtensionById('qtiItemPci');
        $this->baseDevDir = $extension->getConstant('DIR_VIEWS').'js/pciCreator/dev/';
        $this->baseDevUrl = $extension->getConstant('BASE_WWW').'js/pciCreator/dev/';
    }

    public function add($archive, $replace = false){

        $returnValue = null;

        $qtiPackageParser = new CreatorPackageParser($archive);
        $qtiPackageParser->validate();
        if($qtiPackageParser->isValid()){

            //obtain the id from manifest file
            $manifest = $qtiPackageParser->getManifest(true);
            $typeIdentifier = $manifest['typeIdentifier'];
            $label = $manifest['label'];

            //check if such PCI creator already exists
            $existingInteraction = $this->getResource($typeIdentifier);
            if($existingInteraction){
                if($replace){
                    $this->remove($typeIdentifier);
                }else{
                    throw new \common_Exception('The Creator Package already exists');
                }
            }

            //extract the package
            $folder = $qtiPackageParser->extract();
            if(!is_dir($folder)){
                throw new ExtractException();
            }

            $directory = $this->storage->spawnDirectory(true);
            $directoryId = $directory->getId();

            //copy content in the directory:
            $this->storage->import($directoryId, $folder);

            $this->registryClass->createInstanceWithProperties(array(
                $this->propTypeIdentifier->getUri() => $typeIdentifier,
                $this->propDirectory->getUri() => $directoryId,
                RDFS_LABEL => $label
            ));

            $returnValue = $this->get($typeIdentifier);
            
        }else{
            throw new \common_Exception('invalid PCI creator package format');
        }

        return $returnValue;
    }

    public function getRegisteredInteractions(){

        $returnValue = array();

        $all = $this->registryClass->getInstances();
        foreach($all as $pci){
            $pciData = $this->getData($pci);
            $returnValue[$pciData['typeIdentifier']] = $pciData;
        }

        return $returnValue;
    }

    public function remove($typeIdentifier){

        $hook = $this->getResource($typeIdentifier);
        if($hook){
            $hook->delete();
            //@todo : remove the directory too!
        }
    }

    public function removeAll(){

        $all = $this->registryClass->getInstances();
        foreach($all as $pci){
            $pci->delete();
        }
    }

    protected function getResource($typeIdentifier){

        $returnValue = null;

        if(!empty($typeIdentifier)){
            $resources = $this->registryClass->searchInstances(array($this->propTypeIdentifier->getUri() => $typeIdentifier), array('like'=>false));
            $returnValue = reset($resources);
        }else{
            throw new \InvalidArgumentException('the type identifier must not be empty');
        }

        return $returnValue;
    }

    protected function getData(core_kernel_classes_Resource $hook){

        $directory = (string) $hook->getUniquePropertyValue($this->propDirectory);
        $label = $hook->getLabel();
        $folder = $this->storage->getDirectoryById($directory)->getPath();
        $typeIdentifier = (string) $hook->getUniquePropertyValue($this->propTypeIdentifier);
        $manifestFile = $folder.DIRECTORY_SEPARATOR.'pciCreator.json';
        $manifest = json_decode(file_get_contents($manifestFile), true);
        $baseUrl = tao_helpers_Uri::url('getFile', 'PciManager', 'qtiItemPci', array(
            'file' => $typeIdentifier.'/'
        ));

        return array(
            'typeIdentifier' => $typeIdentifier,
            'label' => $label,
            'directory' => $folder,
            'baseUrl' => $baseUrl,
            'manifest' => $manifest,
            'file' => $this->getEntryPointFile($typeIdentifier)
        );
    }

    public function get($typeIdentifier){

        $returnValue = null;
        $hook = $this->getResource($typeIdentifier);

        if($hook){
            $returnValue = $this->getData($hook);
        }

        return $returnValue;
    }
    
    private function getEntryPointFile($baseUrl){
        return $baseUrl.'/pciCreator';
    }
    
    /**
     * Get PCI Creator hook directly located in views/js/pciCreator/myCustomInteraction:
     * 
     * @return array
     */
    public function getDevInteractions(){

        $returnValue = array();

        foreach(glob($this->baseDevDir.'*/pciCreator.js') as $file){

            $dir = str_replace('pciCreator.js', '', $file);
            $manifestFile = $dir.'pciCreator.json';
            
            if(file_exists($manifestFile)){
                
                $typeIdentifier = basename($dir);
                $baseUrl = $this->baseDevUrl.$typeIdentifier.'/';
                $manifest = json_decode(file_get_contents($manifestFile), true);

                $returnValue[] = array(
                    'typeIdentifier' => $typeIdentifier,
                    'label' => $manifest['label'],
                    'directory' => $dir,
                    'baseUrl' => $baseUrl,
                    'file' => $this->getEntryPointFile($typeIdentifier),
                    'manifest' => $manifest,
                    'dev' => true
                );
            }else{
                \common_Logger::d('missing manifest file pciCreator.json');
            }
        }

        return $returnValue;
    }
    
    public function getDevInteraction($typeIdentifier){
        
        //@todo : re-implement it to be more optimal
        $devInteracitons = $this->getDevInteractions();
        foreach($devInteracitons as $interaction){
            if($interaction['typeIdentifier'] == $typeIdentifier){
                return $interaction;
            }
        }
        return null;
    }
    
    public function getDevInteractionDirectory($typeIdentifier){
        $dir = $this->baseDevDir.$typeIdentifier;
        if(file_exists($dir)){
            return $dir;
        }else{
            throw new \common_Exception('the type identifier cannot be found');
        }
    }
}