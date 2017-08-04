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
 * */

namespace oat\qtiItemPci\scripts\install;

use oat\qtiItemPci\model\PciModel;
use oat\qtiItemPci\model\IMSPciModel;
use oat\taoQtiItem\model\portableElement\model\PortableModelRegistry;

class RegisterPciModel extends \common_ext_action_InstallAction
{
    public function __invoke($params)
    {
        PortableModelRegistry::getRegistry()->register(new PciModel());
        PortableModelRegistry::getRegistry()->register(new IMSPciModel());
        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'Pci Model successfully registered.');
    }
}