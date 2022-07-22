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
 * Copyright (c) 2014-2022 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\qtiItemPci\controller;

use common_Exception;
use common_exception_Error;
use oat\qtiItemPci\model\portableElement\dataObject\PciDataObject;
use oat\tao\model\http\formatter\ResponseFormatter;
use oat\taoQtiItem\model\portableElement\exception\PortableElementException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementInvalidModelException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementNotFoundException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementParserException;
use oat\taoQtiItem\model\portableElement\element\PortableElementObject;
use oat\taoQtiItem\model\portableElement\exception\PortableElementVersionIncompatibilityException;
use oat\taoQtiItem\model\portableElement\model\PortableModelRegistry;
use oat\taoQtiItem\model\portableElement\storage\PortableElementRegistry;
use oat\taoQtiItem\model\portableElement\PortableElementService;

/**
 * Actions for pci portable custom elements management
 * Class PciManager
 * @author Bartlomiej Marszal
 */
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

    /**
     * @param $method
     * @param $arguments
     * @security("hide");
     */
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

    public function index()
    {
        $this->setView('pci-manager/index.tpl');
    }

    protected function getService()
    {
        if (!$this->service) {
            $this->service = new PortableElementService();
            $this->service->setServiceLocator($this->getServiceManager());
        }
        return $this->service;
    }

    /**
     * Returns the list of registered custom interactions and their data
     */
    public function getRegisteredImplementations()
    {
        $returnValue = [];

        $pciModels = $this->getPciModels();
        foreach ($pciModels as $pciModel) {
            $all = $pciModel->getRegistry()->getLatest();
            foreach ($all as $portableElement) {
                $returnValue[$portableElement->getTypeIdentifier()] = $this->getMinifiedModel($portableElement);
            }
        }
        uasort($returnValue, function ($a, $b) {
            return $a['runtimeOnly'] > $b['runtimeOnly'];
        });
        $this->returnJson($returnValue);
    }

    /**
     * Return the list of registered PCI php subclasses
     * @return array
     */
    protected function getPciModels()
    {
        $pciModels = [];
        foreach (PortableModelRegistry::getRegistry()->getModels() as $model) {
            if (is_subclass_of($model->getQtiElementClassName(), '\\oat\\taoQtiItem\\model\\qti\\interaction\\CustomInteraction')) {
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
     * @throws common_Exception
     */
    public function verify(ResponseFormatter $responseFormatter): void
    {
        $result = [
            'valid' => false,
            'exists' => false
        ];

        $formatter = $responseFormatter->withJsonHeader();

        try {
            $pciObject = $this->createExistingTypePciObjectFromUploadedPackage();
            $result['valid'] = true;
        } catch (PortableElementException $e) {
            $result['messages'] = $e->getReportMessages() ?: [['message' => $e->getMessage()]];
            $this->setResponse($formatter->withBody($result)->format($this->getPsrResponse()));

            return;
        }

        $all = $pciObject->getModel()->getRegistry()->getLatestCreators();
        if (isset($all[$pciObject->getTypeIdentifier()])) {
            $result['exists'] = true;
            $currentVersion = $all[$pciObject->getTypeIdentifier()]->getVersion();
            if (version_compare($pciObject->getVersion(), $currentVersion, '<')) {
                $result['valid'] = false;
                $result['messages'][] = [
                    'message' =>
                    __(
                        'A newer version of the pci "%s" already exists (current version: %s, target version: %s)',
                        $pciObject->getTypeIdentifier(),
                        $currentVersion,
                        $pciObject->getVersion()
                    )
                ];
                $this->setResponse($formatter->withBody($result)->format($this->getPsrResponse()));

                return;
            }
        }

        $this->setResponse($formatter->withBody(
            array_merge($result, $this->getMinifiedModel($pciObject))
        )->format($this->getPsrResponse()));
    }

    /**
     * @throws PortableElementException
     * @throws common_Exception
     */
    private function createExistingTypePciObjectFromUploadedPackage(): PortableElementObject
    {
        $file = \tao_helpers_Http::getUploadedFile('content');

        $errorMessage = 'Unable to find a valid PCI manifest';

        foreach ($this->getPciModels() as $pciModel) {
            try {

                return $this->getService()->getValidPortableElementFromZipSource($pciModel->getId(), $file['tmp_name']);
            } catch (PortableElementParserException $e) {
                $errorMessage = $e->getMessage();
            }
        }

        throw new PortableElementInvalidModelException($errorMessage);
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
        } catch (common_exception_Error $e) {
            throw new PortableElementParserException('Unable to handle uploaded package.', 0, $e);
        }

        $pciModels = $this->getPciModels();
        foreach ($pciModels as $pciModel) {
            try {
                $portableElement = $this->getService()->import($pciModel->getId(), $file['tmp_name']);
                $this->returnJson($this->getMinifiedModel($portableElement));
                if (!is_null($portableElement)) {
                    break;//stop at the first one
                }
            } catch (PortableElementInvalidModelException $e) {
            } catch (PortableElementParserException $e) {
            }
        }
    }

    /**
     * Export PCI zip package with all runtime, creator & manifest files
     */
    public function export()
    {
        //as upload may be called multiple times, we remove the session lock as soon as possible
        session_write_close();
        $requestPayload = $this->getPsrRequest()->getQueryParams();
        try {
            if (!isset($requestPayload['typeIdentifier'], $requestPayload['pciIdentifier'])) {
                throw new PortableElementException('PCI parameter missing.');
            }
            $path = $this->getService()->export($requestPayload['pciIdentifier'], $requestPayload['typeIdentifier']);
            \tao_helpers_Http::returnFile($path);
        } catch (common_Exception $e) {
            $this->returnJson(['error' => $e->getMessage()]);
        }
    }

    protected function getMinifiedModel(PortableElementObject $object)
    {
        $data = $object->toArray(['typeIdentifier', 'label']);
        $data['runtimeOnly'] = empty($object->getCreator());
        $data['version'] = $object->getVersion();
        $data['enabled'] = $object->isEnabled();
        $data['model'] = $object->getModelLabel();
        $data['pci_identifier'] = $object->getModelId();
        return $data;
    }

    /**
     * @return PciDataObject
     * @throws PortableElementException
     */
    protected function getRequestPciDataObject()
    {
        if (!$this->hasRequestParameter('typeIdentifier')) {
            throw new PortableElementException('Type identifier parameter missing.');
        }
        $typeIdentifier = $this->getRequestParameter('typeIdentifier');

        $pciModels = $this->getPciModels();
        $pciDataObjects = [];
        foreach ($pciModels as $pciModel) {
            try {
                $pciDataObject = $pciModel->getRegistry()->getLatestVersion($typeIdentifier);
                if (!is_null($pciDataObject)) {
                    $pciDataObjects[$typeIdentifier] = $pciDataObject;
                }
            } catch (PortableElementNotFoundException $e) {
                continue;
            }
        }

        if (!empty($pciDataObjects)) {
            return $pciDataObjects[$typeIdentifier];
        }

        throw new PortableElementException('Element not found');
    }


    /**
     * @throws PortableElementException
     * @throws PortableElementVersionIncompatibilityException
     * @throws common_Exception
     * @throws common_exception_Error
     * @throws \HttpRequestException
     */
    public function unregister()
    {
        try {
            $pci = $this->getRequestPciDataObject();
            $registry = $pci->getModel()->getRegistry();
            $registry->removeAllVersions($pci->getTypeIdentifier());
        } catch (\Exception $e) {
            throw new PortableElementException('Could not unregister element');
        }

        $this->returnJson([
            'success' => true
        ]);
    }

    /**
     * Enable pci object
     * @throws PortableElementException
     */
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

    /**
     * disable pci data object
     * @throws PortableElementException
     */
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
