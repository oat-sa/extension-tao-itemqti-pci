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

namespace oat\qtiItemPci\controller;

use oat\qtiItemPci\model\PciModel;
use oat\taoQtiItem\model\portableElement\exception\PortableElementException;
use oat\taoQtiItem\model\portableElement\storage\PortableElementRegistry;
use \tao_actions_CommonModule;

class PciLoader extends tao_actions_CommonModule
{
    /** @var PortableElementRegistry */
    protected $registry;

    /**
     * Load latest PCI runtimes
     */
    public function load()
    {
        try {
            //add option to load from source (as opposed to load from min.js files)
            $this->returnJson($this->getPciRegistry()->getLatestRuntimes());
        } catch (PortableElementException $e) {
            $this->returnJson($e->getMessage(), 500);
        }
    }

    /**
     * @return PortableElementRegistry
     */
    protected function getPciRegistry()
    {
        if (! $this->registry) {
            $this->registry = (new PciModel())->getRegistry();
        }
        return $this->registry;
    }
}
