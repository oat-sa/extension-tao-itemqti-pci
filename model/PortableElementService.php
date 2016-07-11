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

    const SERVICE_ID = 'qtiItemPci/service';

    /**
     * @var PortableElementRegistry[]
     */
    protected $registry;

    /**
     * Singletons of registry service associated with $model
     *
     * @param PortableElementModel $model
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
     * Validate a model using associated validator
     *
     * @param PortableElementModel $model
     * @param null $source Directory of portable element, if not null it will be checked
     * @param array $validationGroup Fields to be checked, empty=$validator->getConstraints()
     * @return bool
     * @throws \common_Exception
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
     * Import a Portable element from an uploaded zip file
     *
     * @param $zipFile
     * @return PortableElementModel
     * @throws \common_Exception
     * @throws \oat\taoQtiItem\model\qti\exception\ExtractException
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

    /**
     * Register a $model with $source into registryEntries & filesystem
     *
     * @param PortableElementModel $model
     * @param $source
     * @return bool
     * @throws \common_Exception
     */
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

    /**
     * Export a model with files into a ZIP
     *
     * @param $identifier ID of model
     * @param null $version If null, latest will be taken
     * @return string Path of zip
     * @throws \common_Exception
     */
    public function export($identifier, $version=null)
    {
        $model = $this->getRegistry(new PciModel())->get($identifier, $version);
        if (is_null($model)) {
            throw new \common_Exception('Unable to find a PCI associated to identifier: ' . $model->getTypeIndentifier());
        }
        $this->validate($model);
        return $this->getRegistry(new PciModel())->export($model);
    }

    /**
     * Extract a valid model from a zip
     *
     * @param $zipFile
     * @return null|PortableElementModel
     * @throws \common_Exception
     * @throws \oat\taoQtiItem\model\qti\exception\ExtractException
     */
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

    /**
     * @param $directory
     * @return null|PortableElementModel
     * @throws \common_Exception
     */
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

    /**
     * Get model from identifier & version
     *
     * @param $identifier
     * @param null $version
     * @return $this|null
     */
    public function getPciByIdentifier($identifier, $version=null)
    {
        return $this->getRegistry(new PciModel())->get($identifier, $version);
    }

    /**
     * Register a model from a directory based on manifest.json
     *
     * @param $directory
     * @return bool
     * @throws \common_Exception
     */
    public function registerFromDirectorySource($directory)
    {
        $model = $this->getValidPortableElementFromDirectorySource($directory);
        if (is_null($model)) {
            throw new \common_Exception('no valid portable element model found in the directory');
        }
        return $this->registerModel($model, $directory);
    }

    /**
     * Fill all values of a model based on $model->getTypeIdentifier, $model->getVersion
     *
     * @param PortableElementModel $model
     * @return $this|null|PciRegistry
     */
    public function hydrateModel(PortableElementModel $model)
    {
        return $this->getRegistry($model)->retrieve($model);
    }

    /**
     * Return the stream of a file model
     *
     * @param PortableElementModel $model
     * @param $file
     * @return bool|false|resource
     * @throws \tao_models_classes_FileNotFoundException
     */
    public function getFileStream(PortableElementModel $model, $file)
    {
        return $this->getRegistry($model)->getFileStream($model, $file);
    }
}