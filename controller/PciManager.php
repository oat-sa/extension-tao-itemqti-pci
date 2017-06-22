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
use oat\qtiItemPci\model\portableElement\dataObject\PciDataObject;
use oat\taoQtiItem\model\portableElement\exception\PortableElementException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementInvalidModelException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementNotFoundException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementParserException;
use oat\taoQtiItem\model\portableElement\element\PortableElementObject;
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

    protected function getDefaultModel()
    {
        return new PciModel();
    }

    protected function getRegistry()
    {
        if (! $this->registry) {
            $this->registry = $this->getDefaultModel()->getRegistry();
        }
        return $this->registry;
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

        $all = $this->getRegistry()->getLatestCreators();
        foreach ($all as $portableElement) {
            $returnValue[$portableElement->getTypeIdentifier()] = $this->getMinifiedModel($portableElement);
        }
        $this->returnJson($returnValue);
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

        try {
            $model = $this->getService()->getValidPortableElementFromZipSource(PciModel::PCI_IDENTIFIER, $file['tmp_name']);
        }  catch (PortableElementInvalidModelException $e) {
            $result['package'] = [
                ['messages' => $e->getReportMessages()]
            ];
            $this->returnJson($result);
            exit();
        }

        if ($model->hasVersion()) {
            $result['exists'] = $this->getRegistry()->has($model->getTypeIdentifier(), $model->getVersion());
        } else {
            $result['exists'] = $this->getRegistry()->has($model->getTypeIdentifier());
        }


        $all = $this->getRegistry()->getLatestCreators();
        if(isset($all[$model->getTypeIdentifier()])){
            $currentVersion = $all[$model->getTypeIdentifier()]->getVersion();
            if(version_compare($model->getVersion(), $currentVersion, '<')){
                $result['package'] = [['message' =>
                    __('A newer version of the pci "%s" already exists (current version: %s, target version: %s)',
                        $model->getTypeIdentifier(), $currentVersion, $model->getVersion())
                ]];
                $result['valid'] = false;
                $this->returnJson($result);
                exit();
            }
        }

        $result['valid'] = true;

        $this->returnJson(array_merge($result, $this->getMinifiedModel($model)));
        exit();
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
        } catch(\common_exception_Error $e) {
            throw new PortableElementParserException('Unable to handle uploaded package.', 0, $e);
        }
        $portableElement = $this->getService()->import(PciModel::PCI_IDENTIFIER, $file['tmp_name']);

        $this->returnJson($this->getMinifiedModel($portableElement));
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

    /**
     * Delete a custom interaction from the registry
     */
    public function delete()
    {
        if (!$this->hasRequestParameter('typeIdentifier')) {
            throw new PortableElementException('Type identifier parameter missing.');
        }
        $typeIdentifier = $this->getRequestParameter('typeIdentifier');
        $this->returnJson([
            'success' => $this->getRegistry()->unregister(new PciDataObject($typeIdentifier))
        ]);
    }

    protected function getMinifiedModel(PortableElementObject $object)
    {
        $data = $object->toArray(array('typeIdentifier', 'label'));
        $data['version'] = $object->getVersion();
        $data['enabled'] = $object->isEnabled();
        return $data;
    }

    protected function getRequestPciDataObject()
    {
        if (!$this->hasRequestParameter('typeIdentifier')) {
            throw new PortableElementException('Type identifier parameter missing.');
        }
        $typeIdentifier = $this->getRequestParameter('typeIdentifier');
        return $this->getRegistry()->getLatestVersion($typeIdentifier);
    }

    public function enable()
    {
        $pci = $this->getRequestPciDataObject();
        $pci->enable();
        $this->getRegistry()->update($pci);
        $this->returnJson([
            'success' => true,
            'interactionHook' => $this->getMinifiedModel($pci)
        ]);
    }

    public function disable()
    {
        $pci = $this->getRequestPciDataObject();
        $pci->disable();
        $this->getRegistry()->update($pci);
        $this->returnJson([
            'success' => true,
            'interactionHook' => $this->getMinifiedModel($pci)
        ]);
    }

}