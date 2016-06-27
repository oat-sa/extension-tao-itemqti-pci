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

use \tao_helpers_Http;
use \tao_actions_CommonModule;
use oat\qtiItemPci\model\PciService;
use oat\qtiItemPci\model\PciRegistry;

class PciManager extends tao_actions_CommonModule
{
    /**
    * Instanciate the controller
    */
    public function __construct(){
        parent::__construct();
        $this->registry = \oat\oatbox\service\ServiceManager::getServiceManager()->get(PciRegistry::SERVICE_ID);
    }
    
    /**
     * Returns the list of registered custom interactions and their data
     */
    public function getRegisteredImplementations(){

        $returnValue = array();

        $all = $this->registry->getLatestCreators();
        foreach($all as $pci){
            $returnValue[$pci->getTypeIdentifier()] = $this->getListingData($pci);
        }

        $this->returnJson($returnValue);
    }
    
    /**
     * Remove security sensitive data to be sent to the client
     * 
     * @param $pciModel
     * @return array
     */
    protected function getListingData($pciModel){
        
        $data = $pciModel->toArray();
        return [
            'typeIdentifier' => $data['typeIdentifier'],
            'label' => $data['label'],
            'version' => $data['version']
        ];
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
        
        $pciService = new PciService();
        $pciModel = $pciService->getValidPciModelFromZipSource($file['tmp_name']);
        if(is_null($pciModel)){
            $result['package'] = [['message'=>__('invalid qti package')]];//@todo provides specific reason why it fails
        }else{
            $id = $pciModel->getTypeIdentifier();
            $targetVersion = $pciModel->getVersion();
            $result['valid'] = true;
            $result['typeIdentifier'] = $id;
            $result['label'] = $pciModel->getLabel();
            $result['version'] = $targetVersion;
            $result['exists'] = $this->registry->exists($pciModel);
            $all = $this->registry->getLatestCreators();
            if(isset($all[$id])){
                $currentVersion = $all[$id]->getVersion();
                if(version_compare($targetVersion, $currentVersion, '<')){
                    $result['package'] = [['message'=>__('a newer version of the pci "%s" already exists (current version: %s, target version: %s)', $id, $currentVersion, $targetVersion)]];
                    $result['valid'] = false;
                }
            }
        }

        $this->returnJson($result);
    }

    /**
     * Add a new custom interaction from the uploaded zip package
     */
    public function add()
    {

        //as upload may be called multiple times, we remove the session lock as soon as possible
        session_write_close();

        try{

            $file = tao_helpers_Http::getUploadedFile('content');
            $pciService = new PciService();
            $pciService->setServiceLocator($this->getServiceManager());
            $pciModel = $pciService->import($file['tmp_name']);

            $this->returnJson($this->getListingData($pciModel));

        } catch(\common_Exception $e) {
            $this->returnJson(array('error' => $e->getMessage()));
        }
    }

    /**
     * Export PCI zip package with all runtime, creator & manifest files
     */
    public function export()
    {
        //as upload may be called multiple times, we remove the session lock as soon as possible
        session_write_close();

        try{
            if (!$this->hasRequestParameter('typeIdentifier')) {
                throw new \common_Exception('Type identifier parameter missing.');
            }

            $pciService = new PciService();
            $pciService->setServiceLocator($this->getServiceManager());
            $data = $pciService->export($this->getRequestParameter('typeIdentifier'));

            $this->returnJson($this->filterInteractionData($data));

        } catch(\common_Exception $e) {
            $this->returnJson(array('error' => $e->getMessage()));
        }
    }

    /**
     * Delete a custom interaction from the registry
     */
    public function delete(){

        $typeIdentifier = $this->getRequestParameter('typeIdentifier');
        $this->returnJson([
            'success' => $this->registry->unregisterInteraction($typeIdentifier)
        ]);
    }

}