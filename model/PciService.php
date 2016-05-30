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
     * Singleton of registry service
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
     * @return PciPackageParser
     */
    protected function getPackageParser($filename)
    {
        if (!$this->parsers[$filename]) {
            $this->parsers[$filename] = new PciPackageParser($filename);
        }
        return $this->parsers[$filename];
    }

    protected function getParser($filename)
    {
        if (!$this->parsers[$filename]) {
            throw new \common_Exception('Unable to find a loaded parser for file ' . $filename);
        }
        return $this->parsers[$filename];
    }

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

    public function import($file)
    {
        // Get Pci Model from zip package
        $pciModel = $this->getPciModelFromZipSource($file);

        // Validate Pci Model
        if (!PciValidator::validate($pciModel)) {
            throw new \common_Exception('Invalid PCI creator package format.');
        }

        // Check if Pci exists
        if ($this->getRegistry()->exists($pciModel)) {
            throw new \common_Exception('The Creator Package already exists.');
        }

        $source = $this->getParser($file)->extract();
        $this->getRegistry()->setSource($source);
        $this->getRegistry()->register($pciModel);

        \tao_helpers_File::delTree($source);

        return $pciModel;
    }
}