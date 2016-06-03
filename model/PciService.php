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

use oat\qtiItemPci\model\validation\PciModelValidator;
use oat\qtiItemPci\model\validation\PciValidator;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

class PciService implements ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;

    /**
     * @var PciRegistry
     */
    protected $registry;

    /**
     * @var array
     */
    protected $parsers;

    /**
     * @var PciPackageExporter
     */
    protected $exporter;

    /**
     * Singleton of registry service
     *
     * @return PciRegistry
     */
    protected function getRegistry()
    {
        if (!$this->registry) {
            $this->registry = $this->getServiceLocator()->get(PciRegistry::SERVICE_ID);
        }
        return $this->registry;
    }

    /**
     * Singleton of parser service
     *
     * @return PciPackageParser
     */
    protected function getPackageParser($filename)
    {
        if (!$this->parsers[$filename]) {
            $this->parsers[$filename] = new PciPackageParser($filename);
        }
        return $this->parsers[$filename];
    }

    /**
     * Extract zip file and return PciModel representation
     *
     * @param $filename
     * @return PciModel
     * @throws \common_Exception
     */
    public function getPciModelFromZipSource($filename)
    {
        try {
            $parser = $this->getPackageParser($filename);
            $parser->validate();
            return $parser->getPciModel();
        } catch (\common_Exception $e) {
            throw new \common_Exception('A error has occurred during parsing package.',0 , $e);
        }
    }

    /**
     * Validate a PCI model using PciModelValidator
     *
     * @param PciModel $pciModel
     * @param $source
     * @return bool
     */
    public function validatePciModel(PciModel $pciModel, $source=null)
    {
        $pciValidator = new PciModelValidator();
        $pciValidator->setModel($pciModel);
        if (!PciValidator::validate($pciValidator)) {
            return false;
        }
        if ($source) {
            return $pciValidator->validateAssets($source);
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
    public function import($file)
    {
        // Get Pci Model from zip package
        $pciModel = $this->getPciModelFromZipSource($file);
        if(is_null($pciModel)){
            return null;
        }

        // Extract zip file
        $source = $this->getParser($file)->extract();


        $pciModel = $this->getValidPciModelFromZipSource($file);
        if (is_null($pciModel)) {
            throw new \common_Exception('Pci zip package is invalid.');
        }

        $this->getRegistry()->setSource($source);
        $this->getRegistry()->register($pciModel);

        \tao_helpers_File::delTree($source);

        return $pciModel;
    }

    public function export($identifier, $version=null)
    {
        $pciModel = $this->getRegistry()->get($identifier, $version);
        if (is_null($pciModel)) {
            throw new \common_Exception('Unable to find a PCI associated to identifier: ' . $pciModel->getTypeIndentifier());
        }
        $this->validatePciModel($pciModel);
        return $this->getRegistry()->export($pciModel);
    }

    public function getValidPciModelFromZipSource($file){

        // Get Pci Model from zip package
        $pciModel = $this->getPciModelFromZipSource($file);
        if(is_null($pciModel)){
            return null;
        }

        // Extract zip file
        $source = $this->getParser($file)->extract();

        // Validate Pci Model
        if ($this->validatePciModel($pciModel, $source)) {
            return $pciModel;
        } else {
            return null;
        }
    }
}