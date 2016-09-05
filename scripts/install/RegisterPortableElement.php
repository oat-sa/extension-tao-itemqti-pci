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

use common_ext_action_InstallAction;
use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\portableElement\PortableElementService;

class RegisterPortableElement extends common_ext_action_InstallAction
{
    public function __invoke($params)
    {
        $service = new PortableElementService();
        $service->setServiceLocator(ServiceManager::getServiceManager());

        $viewDir = \common_ext_ExtensionsManager::singleton()->getExtensionById('qtiItemPci')->getConstant('DIR_VIEWS');

        $sourceLikertScale = $viewDir.implode(DIRECTORY_SEPARATOR, ['js', 'pciCreator', 'dev', 'likertScaleInteraction']).DIRECTORY_SEPARATOR;
        $sourceLiquid = $viewDir.implode(DIRECTORY_SEPARATOR, ['js', 'pciCreator', 'dev', 'liquidsInteraction']).DIRECTORY_SEPARATOR;
        $service->registerFromDirectorySource($sourceLikertScale);
        $service->registerFromDirectorySource($sourceLiquid);

        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'PCI registered');
    }
}
