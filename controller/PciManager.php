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

use oat\qtiItemPci\model\PciPackageParser;
use oat\qtiItemPci\model\PciPackageService;
use oat\qtiItemPci\model\PciParserItemRegistry;
use oat\qtiItemPci\model\PciService;
use oat\taoQtiItem\controller\AbstractPortableElementManager;
use \tao_helpers_Http;
use \FileUploadException;
use oat\qtiItemPci\model\CreatorRegistry;
use oat\qtiItemPci\model\CreatorPackageParser;
use oat\qtiItemPci\model\PciRegistry;

class PciManager extends AbstractPortableElementManager
{
    
    protected function getCreatorRegistry(){
        return \oat\oatbox\service\ServiceManager::getServiceManager()->get(PciRegistry::SERVICE_ID);
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
            $result['valid'] = true;
            $result['typeIdentifier'] = $pciModel->getTypeIdentifier();
            $result['label'] = $pciModel->getLabel();
            $result['version'] = $pciModel->getVersion();
            $result['exists'] = $this->registry->exists($pciModel);
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
     * Delete a custom interaction from the registry
     */
    public function delete(){

        $typeIdentifier = $this->getRequestParameter('typeIdentifier');
        $this->returnJson([
            'success' => $this->registry->unregisterInteraction($typeIdentifier)
        ]);
    }
    
    /**
     * Get the directory where the implementation sits
     * 
     * @deprecated
     * @param string $typeIdentifier
     * @return string
     */
    protected function getImplementationDirectory($typeIdentifier){
        $pci = $this->registry->get($typeIdentifier);
        if(is_null($pci)){
            $folder = $this->registry->getDevImplementationDirectory($typeIdentifier);
        }else{
            $folder = $pci['directory'];
        }
        return $folder;
    }

}