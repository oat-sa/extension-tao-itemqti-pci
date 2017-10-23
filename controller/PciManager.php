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

use oat\qtiItemPci\model\PciModel;
use oat\taoQtiItem\model\portableElement\exception\PortableElementException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementInvalidModelException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementNotFoundException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementParserException;
use oat\taoQtiItem\model\portableElement\element\PortableElementObject;
use oat\taoQtiItem\model\portableElement\model\PortableModelRegistry;
use oat\taoQtiItem\model\portableElement\storage\PortableElementRegistry;
use oat\taoQtiItem\model\portableElement\PortableElementService;

class PciManager extends \tao_actions_CommonModule
{
    /**
     * @var PortableElementRegistry
     */
    protected $registry;

    /**
     * @var PortableElementService
     */
    protected $service;

    public function __call($method, $arguments)
    {
        try {
            $this->$method($arguments);
        } catch (PortableElementNotFoundException $e) {
            $this->returnJson($e->getMessage(), 404);
        } catch (PortableElementException $e) {
            $this->returnJson($e->getMessage(), 500);
        }
    }

    protected function getService()
    {
        if (! $this->service) {
            $this->service = new PortableElementService();
            $this->service->setServiceLocator($this->getServiceManager());
        }
        return $this->service;
    }

    /**
     * Returns the list of registered custom interactions and their data
     */
    public function getRegisteredImplementations(){

        $returnValue = array();

        $pciModels = $this->getPciModels();
        foreach ($pciModels as $pciModel) {
            $all = $pciModel->getRegistry()->getLatestCreators();
            foreach ($all as $portableElement) {
                $returnValue[$portableElement->getTypeIdentifier()] = $this->getMinifiedModel($portableElement);
            }
        }

        $this->returnJson($returnValue);
    }

    /**
     * Return the list of registered PCI php subclasses
     * @return array
     */
    private function getPciModels(){
        $pciModels = [];
        foreach(PortableModelRegistry::getRegistry()->getModels() as $model){
            if(is_subclass_of($model->getQtiElementClassName(), '\\oat\\taoQtiItem\\model\\qti\\interaction\\CustomInteraction')){
                $pciModels[] = $model;
            }
        }
        return $pciModels;
    }

    /**
     * Service to check if the uploaded file archive is a valid and non-existing one
     * 
     * JSON structure:
     * {
     *     "valid" : true/false (if is a valid package) 
     *     "exists" : true/false (if the package is valid, check if the typeIdentifier is already used in the registry)
     * }
     *
     * @throws PortableElementParserException
     * @throws PortableElementInvalidModelException
     */
    public function verify()
    {
        $result = array(
            'valid' => false,
            'exists' => false
        );

        try {
            $file = \tao_helpers_Http::getUploadedFile('content');
        } catch (\common_exception_Error $e) {
            throw new PortableElementParserException('Unable to handle uploaded package.', 0, $e);
        }

        $invalidModelErrors = [];
        $pciModels = $this->getPciModels();
        $pciObject = null;
        foreach($pciModels as $pciModel){
            try {
                $pciObject = $this->getService()->getValidPortableElementFromZipSource($pciModel->getId(), $file['tmp_name']);
                if(!is_null($pciObject)){
                    break;//stop at the first one
                }
            } catch (PortableElementInvalidModelException $e) {
                $invalidModelErrors = $e->getReportMessages();
            } catch (PortableElementParserException $e){
                $invalidModelErrors[] = ['message' => $e->getMessage()];
            }
        }

        if(is_null($pciObject)){
            //no valid pci has been found in pacakges so return error messages
            $result['package'] = [
                ['messages' => $invalidModelErrors]
            ];
            $this->returnJson($result);
            exit();
        }

        if ($pciObject->hasVersion()) {
            $result['exists'] = $pciObject->getModel()->getRegistry()->has($pciObject->getTypeIdentifier(), $pciObject->getVersion());
        } else {
            $result['exists'] = $pciObject->getModel()->getRegistry()->has($pciObject->getTypeIdentifier());
        }


        $all = $pciObject->getModel()->getRegistry()->getLatestCreators();
        if(isset($all[$pciObject->getTypeIdentifier()])){
            $currentVersion = $all[$pciObject->getTypeIdentifier()]->getVersion();
            if(version_compare($pciObject->getVersion(), $currentVersion, '<')){
                $result['package'] = [['message' =>
                    __('A newer version of the pci "%s" already exists (current version: %s, target version: %s)',
                        $pciObject->getTypeIdentifier(), $currentVersion, $pciObject->getVersion())
                ]];
                $result['valid'] = false;
                $this->returnJson($result);
                exit();
            }
        }

        $result['valid'] = true;

        $this->returnJson(array_merge($result, $this->getMinifiedModel($pciObject)));
    }

    /**
     * Add a new custom interaction from the uploaded zip package
     */
    public function add()
    {
        //as upload may be called multiple times, we remove the session lock as soon as possible
        session_write_close();

        try {
            $file = \tao_helpers_Http::getUploadedFile('content');
        } catch (\common_exception_Error $e) {
            throw new PortableElementParserException('Unable to handle uploaded package.', 0, $e);
        }

        $pciModels = $this->getPciModels();
        foreach ($pciModels as $pciModel) {
            try {
                $portableElement = $this->getService()->import($pciModel->getId(), $file['tmp_name']);
                $this->returnJson($this->getMinifiedModel($portableElement));
                if(!is_null($portableElement)){
                    break;//stop at the first one
                }
            } catch (PortableElementInvalidModelException $e) {
            } catch (PortableElementParserException $e) {
            }
        }
    }

    /**
     * Export PCI zip package with all runtime, creator & manifest files
     * Not used yet
     * @todo Download path e.q. $path
     */
    public function export()
    {
        //as upload may be called multiple times, we remove the session lock as soon as possible
        session_write_close();

        try{
            if (!$this->hasRequestParameter('typeIdentifier')) {
                throw new PortableElementException('Type identifier parameter missing.');
            }

            $identifier = $this->getRequestParameter('typeIdentifier');
            $path = $this->getService()->export(PciModel::PCI_IDENTIFIER, $identifier);
            $object = $this->getService()->getPortableElementByIdentifier(PciModel::PCI_IDENTIFIER, $identifier);
            $this->returnJson($this->getMinifiedModel($object));

        } catch(\common_Exception $e) {
            $this->returnJson(array('error' => $e->getMessage()));
        }
    }

    protected function getMinifiedModel(PortableElementObject $object)
    {
        $data = $object->toArray(array('typeIdentifier', 'label'));
        $data['version'] = $object->getVersion();
        $data['enabled'] = $object->isEnabled();
        $data['model'] = $object->getModelLabel();
        return $data;
    }

    protected function getRequestPciDataObject()
    {
        if (!$this->hasRequestParameter('typeIdentifier')) {
            throw new PortableElementException('Type identifier parameter missing.');
        }
        $typeIdentifier = $this->getRequestParameter('typeIdentifier');

        $pciModels = $this->getPciModels();
        foreach ($pciModels as $pciModel) {
            try {
                $pciDataObject = $pciModel->getRegistry()->getLatestVersion($typeIdentifier);
                if(!is_null($pciDataObject)){
                    return $pciDataObject;
                }
            } catch (PortableElementNotFoundException $e) {
            }
        }

        return null;
    }

    public function enable()
    {
        $pci = $this->getRequestPciDataObject();
        $pci->enable();
        $pci->getModel()->getRegistry()->update($pci);
        $this->returnJson([
            'success' => true,
            'interactionHook' => $this->getMinifiedModel($pci)
        ]);
    }

    public function disable()
    {
        $pci = $this->getRequestPciDataObject();
        $pci->disable();
        $pci->getModel()->getRegistry()->update($pci);
        $this->returnJson([
            'success' => true,
            'interactionHook' => $this->getMinifiedModel($pci)
        ]);
    }

}