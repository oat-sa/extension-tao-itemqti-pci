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

use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\qti\exception\ExtractException;
use oat\taoQtiItem\model\qti\Parser;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

class PciParserItemRegistry extends PciPackageParser implements ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;

    /**
     * @var PciRegistry
     */
    protected $registry;

    protected function getRegistry()
    {
        if (!$this->registry) {
            $this->registry = $this->getServiceLocator()->get(PciRegistry::SERVICE_ID);
        }
        return $this->registry;
    }

    public function import($override=false)
    {
        $this->validate();
        if (!$this->isValid()) {
            throw new \common_Exception('Invalid PCI creator package format');
        }

        //obtain the id from manifest file
        $manifest = $this->getManifest();
        $typeIdentifier = $manifest['typeIdentifier'];

        //check if such PCI creator already exists
        if ($this->registry->exists($typeIdentifier)) {
            if ($override) {
                $this->registry->remove($typeIdentifier);
            } else {
                throw new \common_Exception('The Creator Package already exists');
            }
        }

        //extract the package
        $temp = $this->extract();
        if(!is_dir($temp)){
            throw new ExtractException();
        }

        $version = $manifest['version'];
        $runtime = $manifest['runtime'];
        $creator = $manifest['creator'];

        $this->registry->register($typeIdentifier, $version, $runtime, $creator);

        return $this->registry->get($typeIdentifier);
    }
}