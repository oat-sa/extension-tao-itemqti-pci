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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 *
 */

namespace oat\qtiItemPci\scripts\update;

use oat\generis\model\OntologyAwareTrait;
use oat\qtiItemPci\scripts\install\RegisterPciLikertScale;
use oat\qtiItemPci\scripts\install\RegisterPciLiquid;
use oat\qtiItemPci\scripts\install\RegisterPciMathEntry;
use oat\qtiItemPci\scripts\install\RegisterPciModel;
use oat\qtiItemPci\scripts\install\SetQtiCreatorConfig;
use oat\qtiItemPci\scripts\install\RegisterClientProvider;
use oat\taoQtiItem\model\HookRegistry;
use oat\taoQtiItem\scripts\SetupPortableElementFileStorage;

class Updater extends \common_ext_ExtensionUpdater
{
    use OntologyAwareTrait;

    /**
     *
     * @param string $currentVersion
     * @return string $versionUpdatedTo
     */
    public function update($currentVersion)
    {
        $this->skip('0', '0.1.4');

        if ($this->isVersion('0.1.4')) {
            $setupPortableElementFileStorage = new SetupPortableElementFileStorage();
            $setupPortableElementFileStorage->setServiceLocator($this->getServiceManager());
            $setupPortableElementFileStorage([]);

            $registerPciModel = new RegisterPciModel();
            $registerPciModel->setServiceLocator($this->getServiceManager());
            $registerPciModel([]);

            $setQtiCreatorConfig = new SetQtiCreatorConfig();
            $setQtiCreatorConfig([]);

            $registerClientProvider = new RegisterClientProvider();
            $registerClientProvider([]);

            call_user_func(new RegisterPciLikertScale(), ['0.2.0']);
            call_user_func(new RegisterPciLiquid(), ['0.2.0']);

            $testManagerRole = $this->getResource('http://www.tao.lu/Ontologies/TAOItem.rdf#ItemsManagerRole');
            $QTIManagerRole = $this->getResource('http://www.tao.lu/Ontologies/TAOItem.rdf#QTIManagerRole');
            $testTakerRole = $this->getResource(INSTANCE_ROLE_DELIVERY);

            $accessService = \funcAcl_models_classes_AccessService::singleton();
            $accessService->grantModuleAccess($testManagerRole, 'qtiItemPci', 'PciLoader');
            $accessService->grantModuleAccess($QTIManagerRole, 'qtiItemPci', 'PciLoader');
            $accessService->grantModuleAccess($testTakerRole, 'qtiItemPci', 'PciLoader');

            HookRegistry::getRegistry()->remove('pciCreator');

            $this->setVersion('1.0.0');
        }

        $this->skip('1.0.0', '1.1.0');

        if($this->isVersion('1.1.0')){
            call_user_func(new RegisterPciMathEntry(), ['0.1.0']);
            $this->setVersion('1.2.0');
        }

        if($this->isVersion('1.2.0')){
            call_user_func(new RegisterPciMathEntry(), ['0.2.0']);
            $this->setVersion('1.3.0');
        }
    }
}