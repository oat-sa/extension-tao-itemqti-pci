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

use oat\taoQtiItem\model\portableElement\common\exception\PortableElementException;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementInvalidModelException;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementNotFoundException;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementParserException;
use oat\taoQtiItem\model\portableElement\common\model\PortableElementModel;
use oat\taoQtiItem\model\portableElement\common\PortableElementFactory;
use oat\taoQtiItem\model\portableElement\pci\model\PciModel;
use oat\taoQtiItem\model\portableElement\PortableElementRegistry;
use \tao_helpers_Http;
use \tao_actions_CommonModule;

class PciManager extends tao_actions_CommonModule
{
    /**
     * @var PortableElementRegistry
     */
    protected $registry = null;

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
        if(is_null($this->registry)){
            $this->registry = PortableElementFactory::getRegistry($this->getDefaultModel());
        }
        return $this->registry;
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
     * @throws \oat\taoQtiItem\model\portableElement\common\exception\PortableElementInvalidModelException
     */
    public function verify()
    {
        $result = array(
            'valid' => false,
            'exists' => false
        );

        try {
            $file = tao_helpers_Http::getUploadedFile('content');
        } catch (\common_exception_Error $e) {
            throw new PortableElementParserException('Unable to handle uploaded package.', 0, $e);
        }

        $service = PortableElementFactory::getService($this->getDefaultModel());

        try {
            $model = $service->getValidPortableElementFromZipSource($file['tmp_name']);
        }  catch (PortableElementInvalidModelException $e) {
            $result['package'] = [['message'=>__($e->getLastMessage())]];
            $this->returnJson($result);
            exit();
        }

        $result['exists'] = $this->getRegistry()->has($model);

        $all = $this->getRegistry()->getLatestCreators();
        if(isset($all[$model->getTypeIdentifier()])){
            $currentVersion = $all[$model->getTypeIdentifier()]->getVersion();
            if(version_compare($model->getVersion(), $currentVersion, '<')){
                $result['package'] = [['message' =>
                    __('A newer version of the pci "%s" already exists (current version: %s, target version: %s)'),
                        $model->getTypeIdentifier(), $currentVersion, $model->getVersion()
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
            $file = tao_helpers_Http::getUploadedFile('content');
        } catch(\common_exception_Error $e) {
            throw new PortableElementParserException('Unable to handle uploaded package.', 0, $e);
        }
        $service = PortableElementFactory::getService($this->getDefaultModel());
        $portableElement = $service->import($file['tmp_name']);

        $this->returnJson($this->getMinifiedModel($portableElement));
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
                throw new PortableElementException('Type identifier parameter missing.');
            }

            $service = PortableElementFactory::getService($this->getDefaultModel());
            $data = $service->export($this->getRequestParameter('typeIdentifier'));

            $this->returnJson($this->getMinifiedModel($data));

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
            'success' => $this->getRegistry()->unregister(new PciModel($typeIdentifier))
        ]);
    }

    protected function getMinifiedModel(PortableElementModel $model)
    {
        return $model->toArray(array('typeIdentifier', 'label', 'version'));
    }

}