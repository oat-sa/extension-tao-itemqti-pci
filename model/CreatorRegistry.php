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
 * CreatorRegistry stores reference to 
 *
 * @package qtiItemPci
 */
class CreatorRegistry
{

    /**
     * The singleton
     * 
     * @var tao_models_classes_service_FileStorage
     */
    private static $instance;

    /**
     * Return the singleton
     * 
     * @return CreatorRegistry
     */
    public static function singleton(){

        if(is_null(self::$instance)){
            self::$instance = new self();
        }

        return self::$instance;
    }
    
    /**
     * 
     */
    protected function __construct(){

        $this->registryClass = new core_kernel_classes_Class('http://www.tao.lu/Ontologies/QtiItemPci.rdf#PciCreatorHook');
        $this->storage = tao_models_classes_service_FileStorage::singleton();
        $this->propTypeIdentifier = new core_kernel_classes_Property('http://www.tao.lu/Ontologies/QtiItemPci.rdf#PciCreatorIdentifier');
        $this->propDirectory = new core_kernel_classes_Property('http://www.tao.lu/Ontologies/QtiItemPci.rdf#PciCreatorDirectory');
        
        $extension = common_ext_ExtensionsManager::singleton()->getExtensionById('qtiItemPci');
        $this->baseDevDir = $extension->getConstant('DIR_VIEWS').'js/pciCreator/dev/';
        $this->baseDevUrl = $extension->getConstant('BASE_WWW').'js/pciCreator/dev/';
    }
    
    /**
     * Register a custom interaction from a zip package
     * 
     * @param string $archive
     * @param boolean $replace
     * @return array
     * @throws \common_Exception
     * @throws ExtractException
     */
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
    
    /**
     * Get the data for all registered interactions
     * 
     * @return array
     */
    public function getRegisteredInteractions(){

        $returnValue = array();

        $all = $this->registryClass->getInstances();
        foreach($all as $pci){
            $pciData = $this->getData($pci);
            $returnValue[$pciData['typeIdentifier']] = $pciData;
        }

        return $returnValue;
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
    
    /**
     * Remove all registered interactions form the registry
     */
    public function removeAll(){

        $all = $this->registryClass->getInstances();
        foreach($all as $pci){
            $pci->delete();
        }
    }
    
    /**
     * Return the rdf resource of a custom interaction from its typeIdentifier
     * 
     * @param string $typeIdentifier
     * @return array
     * @throws \InvalidArgumentException
     */
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
    
    /**
     * Get the data of a registered custom interaction from its rdf resource 
     * 
     * @param core_kernel_classes_Resource $hook
     * @return array
     */
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
    
    /**
     * Return the data of a registered custom interaction from its typeIdentifier
     * 
     * @param string $typeIdentifier
     * @return array
     */
    public function get($typeIdentifier){

        $returnValue = null;
        $hook = $this->getResource($typeIdentifier);

        if($hook){
            $returnValue = $this->getData($hook);
        }

        return $returnValue;
    }
    
    /**
     * Get the entry point file path from the baseUrl
     * 
     * @param string $baseUrl
     * @return string
     */
    private function getEntryPointFile($baseUrl){
        return $baseUrl.'/pciCreator';
    }
    
    /**
     * Get PCI Creator hooks directly located at views/js/pciCreator/myCustomInteraction:
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
            }
        }

        return $returnValue;
    }
    
    /**
     * Get PCI Creator hook located at views/js/pciCreator/$typeIdentifier
     * 
     * @param string $typeIdentifier
     * @return array
     */
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
    
    /**
     * Get the path to the directory of a PCI Creator located at views/js/pciCreator/
     * 
     * @param string $typeIdentifier
     * @return string
     * @throws \common_Exception
     */
    public function getDevInteractionDirectory($typeIdentifier){
        $dir = $this->baseDevDir.$typeIdentifier;
        if(file_exists($dir)){
            return $dir;
        }else{
            throw new \common_Exception('the type identifier cannot be found');
        }
    }
}