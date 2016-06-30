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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\qtiItemPci\model;

use oat\qtiItemPci\model\common\model\PortableElementModel;
use oat\qtiItemPci\model\common\PortableElementFactory;
use oat\qtiItemPci\model\common\validator\Validator;
use oat\qtiItemPci\model\pci\model\PciModel;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

class PortableElementService implements ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;

    /**
     * @var array of PortableElementRegistry
     */
    protected $registry;

    /**
     * Singleton of registry service
     *
     * @return PortableElementRegistry
     */
    protected function getRegistry(PortableElementModel $model)
    {
        if (!$this->registry[get_class($model)]) {
            $this->registry[get_class($model)] = $this->getServiceLocator()
                ->get(PortableElementFactory::SERVICE_ID)
                ->getRegistry($model);
        }
        return $this->registry[get_class($model)];
    }

    /**
     * Validate a PCI model using PciModelValidator
     *
     * @param PortableElementModel $model
     * @param $source
     * @return bool
     */
    public function validate(PortableElementModel $model, $source=null, $validationGroup=array())
    {
        $validator = PortableElementFactory::getValidator($model);
        if (!Validator::validate($validator, $validationGroup)) {
            return false;
        }
        if ($source) {
            return $validator->validateAssets($source);
        }
        return true;
    }

    /**
     * Import a PCI from an uploaded zip file
     * 1°) Extract zip
     * 2°) Check if exists
     * 3°) Extract data
     * 4°) Validate PciModel
     * 5°) Register into PCI registry
     *
     * @param $file
     * @return PciModel
     * @throws \common_Exception
     */
    public function import($zipFile)
    {
        $parser = PortableElementFactory::getPackageParser($zipFile);
        $source = $parser->extract();
        $model = $parser->getModel();

        $this->registerModel($model, $source);

        \tao_helpers_File::delTree($source);

        return $model;
    }

    public function registerModel(PortableElementModel $model, $source)
    {
        if (is_null($model)) {
            throw new \common_Exception('Zip package is invalid for portable element.');
        }

        $validationGroup = array('typeIdentifier', 'version', 'runtime');
        if (!$this->validate($model, $source, $validationGroup)) {
            throw new \common_Exception('Portable element is invalid.');
        }

        $this->getRegistry($model)->setSource($source);
        $this->getRegistry($model)->register($model);

        return true;
    }

    public function export($identifier, $version=null)
    {
        $model = $this->getRegistry(new PciModel())->get($identifier, $version);
        if (is_null($model)) {
            throw new \common_Exception('Unable to find a PCI associated to identifier: ' . $model->getTypeIndentifier());
        }
        $this->validate($model);
        return $this->getRegistry(new PciModel())->export($model);
    }

    public function getValidPortableElementFromZipSource($zipFile)
    {
        $parser = PortableElementFactory::getPackageParser($zipFile);
        $source = $parser->extract();
        $model = $parser->getModel();

        // Validate Portable Element Model
        if (!$this->validate($model, $source)) {
            return null;
        }

        return $model;
    }

    public function getValidPortableElementFromDirectorySource($directory)
    {
        $parser = PortableElementFactory::getDirectoryParser($directory);
        $source = $parser->extract();
        $model = $parser->getModel();

        // Validate Portable Element  Model
        if (!$this->validate($model, $source)) {
            return null;
        }

        return $model;
    }

    public function getPciByIdentifier($identifier, $version=null)
    {
        return $this->getRegistry(new PciModel())->get($identifier, $version);
    }

    public function registerFromDirectorySource($directory){
        $model = $this->getValidPortableElementFromDirectorySource($directory);
        if(is_null($model)){
            throw new \common_Exception('no valid portable element model found in the directory');
        }
        return $this->registerModel($model, $directory);
    }
}