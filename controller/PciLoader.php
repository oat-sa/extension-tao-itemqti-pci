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
 * Copyright (c) 2016-2018 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\qtiItemPci\controller;

use oat\qtiItemPci\model\PciLoaderService;
use oat\qtiItemPci\model\PciModel;
use oat\qtiItemPci\model\IMSPciModel;
use \tao_actions_CommonModule;

class PciLoader extends tao_actions_CommonModule
{
    /**
     * Load latest PCI runtime
     */
    public function load()
    {
        /** @var PciLoaderService $pciLoaderService */
        $pciLoaderService = $this->getServiceLocator()->get(PciLoaderService::SERVICE_ID);
        try {
            $this->returnJson($pciLoaderService->load());
        } catch (\Exception $e) {
            $this->returnJson($e->getMessage(), 500);
        }
    }

    protected function getRegistries(){
        return [(new PciModel())->getRegistry(), (new IMSPciModel())->getRegistry()];
    }
}
