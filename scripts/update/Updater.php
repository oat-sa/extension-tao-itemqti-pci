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
use oat\qtiItemPci\model\IMSPciModel;
use oat\qtiItemPci\model\PciModel;
use oat\qtiItemPci\model\portableElement\storage\PciRegistry;
use oat\qtiItemPci\scripts\install\RegisterPciAudioRecording;
use oat\qtiItemPci\scripts\install\RegisterPciFilesystem;
use oat\qtiItemPci\scripts\install\RegisterPciLikertScale;
use oat\qtiItemPci\scripts\install\RegisterPciLiquid;
use oat\qtiItemPci\scripts\install\RegisterPciMathEntry;
use oat\qtiItemPci\scripts\install\RegisterPciModel;
use oat\qtiItemPci\scripts\install\SetQtiCreatorConfig;
use oat\qtiItemPci\scripts\install\RegisterClientProvider;
use oat\tao\model\accessControl\func\AccessRule;
use oat\tao\model\accessControl\func\AclProxy;
use oat\tao\model\TaoOntology;
use oat\taoQtiItem\model\HookRegistry;
use oat\taoQtiItem\model\portableElement\model\PortableModelRegistry;
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

        //this is related to the actual version of the source code,
        //otherwise it's not possible to register any PCI
        $this->runExtensionScript(RegisterPciFilesystem::class);

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

            // Grants access on PciLoader for TestManager role.
            AclProxy::applyRule(new AccessRule(
                AccessRule::GRANT,
                'http://www.tao.lu/Ontologies/TAOItem.rdf#ItemsManagerRole',
                ['ext' => 'qtiItemPci' , 'mod' => 'PciLoader']
            ));

            // Grants access on PciLoader for QTIManager role.
            AclProxy::applyRule(new AccessRule(
                AccessRule::GRANT,
                'http://www.tao.lu/Ontologies/TAOItem.rdf#QTIManagerRole',
                ['ext' => 'qtiItemPci' , 'mod' => 'PciLoader']
            ));

            // Grants access on PciLoader for TestTaker role.
            AclProxy::applyRule(new AccessRule(
                AccessRule::GRANT,
				TaoOntology::PROPERTY_INSTANCE_ROLE_DELIVERY,
                ['ext' => 'qtiItemPci' , 'mod' => 'PciLoader']
            ));

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

        if($this->isVersion('1.3.0')){
            call_user_func(new RegisterPciMathEntry(), ['0.3.0']);
            $this->setVersion('1.4.0');
        }

        if($this->isVersion('1.4.0')){
            call_user_func(new RegisterPciAudioRecording(), ['0.1.0']);
            $this->setVersion('1.5.0');
        }

        if($this->isVersion('1.5.0')){
            call_user_func(new RegisterPciAudioRecording(), ['0.1.1']);
            $this->setVersion('1.5.1');
        }

        if($this->isVersion('1.5.1')){
            call_user_func(new RegisterPciAudioRecording(), ['0.1.2']);
            $this->setVersion('1.5.2');
        }

        if($this->isVersion('1.5.2')){
            call_user_func(new RegisterPciMathEntry(), ['0.4.0']);
            $this->setVersion('1.6.0');
        }

        if($this->isVersion('1.6.0')){
            call_user_func(new RegisterPciMathEntry(), ['0.4.1']);
            $this->setVersion('1.6.1');
        }

        if($this->isVersion('1.6.1')){
            call_user_func(new RegisterPciMathEntry(), ['0.4.2']);
            $this->setVersion('1.6.2');
        }

        $this->skip('1.6.2', '2.0.2');

        if($this->isVersion('2.0.2')){
            call_user_func(new RegisterPciLikertScale(), ['0.3.0']);
            $this->setVersion('2.1.0');
        }

        $this->skip('2.1.0', '2.2.1');

        if($this->isVersion('2.2.1')){
            call_user_func(new RegisterPciAudioRecording(), ['0.1.3']);
            $this->setVersion('2.2.2');
        }

        if($this->isVersion('2.2.2')){
            $this->runExtensionScript(RegisterPciFilesystem::class);

            $model = new PciModel();
            $registry = PciRegistry::getRegistry();
            $registry->setServiceLocator($this->getServiceManager());
            $registry->setModel($model);

            /** @var \common_ext_ExtensionsManager $extensionManager */
            $extensionManager = $this->getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID);

            if($extensionManager->getExtensionById(PciRegistry::REGISTRY_EXTENSION)->hasConfig(PciRegistry::REGISTRY_ID)){
                $map = $extensionManager->getExtensionById(PciRegistry::REGISTRY_EXTENSION)->getConfig(PciRegistry::REGISTRY_ID);

                if(is_array($map)){
                    foreach ($map as $key => $value){
                        uksort($value, function($a, $b) {
                            return version_compare($a, $b, '<');
                        });
                        $portableElementObject = $model->createDataObject(reset($value));
                        //set it the new way
                        $registry->update($portableElementObject);
                    }
                }

                $extensionManager->getExtensionById(PciRegistry::REGISTRY_EXTENSION)->unsetConfig(PciRegistry::REGISTRY_ID);
            }
            $this->setVersion('3.0.0');
        }

        $this->skip('3.0.0', '3.0.1');

        if($this->isVersion('3.0.1')) {
            //automatically enable all current installed portable elements
            $model = PortableModelRegistry::getRegistry()->getModel(PciModel::PCI_IDENTIFIER);
            $portableElementRegistry = $model->getRegistry();
            $registeredPortableElements = array_keys($portableElementRegistry->getLatestRuntimes());
            foreach($registeredPortableElements as $typeIdentifier){
                $portableElement = $portableElementRegistry->fetch($typeIdentifier);
                if (! $portableElement->hasEnabled()) {
                    $portableElement->enable();
                    $portableElementRegistry->update($portableElement);
                }
            }
            $this->setVersion('3.0.2');
        }

        $this->skip('3.0.2', '3.0.4');

        if($this->isVersion('3.0.4')){
            call_user_func(new RegisterPciLikertScale(), ['0.3.1']);
            PortableModelRegistry::getRegistry()->register(new IMSPciModel());
            $this->setVersion('3.1.0');
        }

        $this->skip('3.1.0', '3.1.1');

        if($this->isVersion('3.1.1')){
            call_user_func(new RegisterPciMathEntry(), ['0.5.0']);
            $this->setVersion('3.2.0');
        }

        if($this->isVersion('3.2.0')){
            call_user_func(new RegisterPciAudioRecording(), ['0.2.0']);
            call_user_func(new RegisterPciLikertScale(), ['0.4.0']);
            call_user_func(new RegisterPciLiquid(), ['0.3.0']);
            call_user_func(new RegisterPciMathEntry(), ['0.5.0']);
            $this->setVersion('3.3.0');
        }

        if($this->isVersion('3.3.0')){
            call_user_func(new RegisterPciMathEntry(), ['0.6.0']);
            $this->setVersion('3.4.0');
        }

        $this->skip('3.4.0', '3.5.0');

        if($this->isVersion('3.5.0')){
            $registry = (new IMSPciModel())->getRegistry();
            if($registry->has('likertScaleInteraction')){
                $registry->removeAllVersions('likertScaleInteraction');
            }
            if($registry->has('liquidsInteraction')){
                $registry->removeAllVersions('liquidsInteraction');
            }
            if($registry->has('mathEntryInteraction')){
                $registry->removeAllVersions('mathEntryInteraction');
            }
            if($registry->has('audioRecordingInteraction')){
                $registry->removeAllVersions('audioRecordingInteraction');
            }
            call_user_func(new RegisterPciAudioRecording(), ['0.2.0']);
            call_user_func(new RegisterPciLikertScale(), ['0.4.0']);
            call_user_func(new RegisterPciLiquid(), ['0.3.0']);
            call_user_func(new RegisterPciMathEntry(), ['0.6.0']);
            $this->setVersion('3.5.1');
        }

        if($this->isVersion('3.5.1')){
            call_user_func(new RegisterPciMathEntry(), ['0.6.1']);
            $this->setVersion('3.5.2');
        }

        if($this->isVersion('3.5.2')){
            call_user_func(new RegisterPciAudioRecording(), ['0.2.1']);
            $this->setVersion('3.5.3');
        }

        if($this->isVersion('3.5.3')){
            call_user_func(new RegisterPciMathEntry(), ['0.7.0']);
            $this->setVersion('3.6.0');
        }

        if($this->isVersion('3.6.0')){
            call_user_func(new RegisterPciAudioRecording(), ['0.2.2']);
            $this->setVersion('3.6.1');
        }

        $this->skip('3.6.1', '4.0.0');

        if($this->isVersion('4.0.0')){
            call_user_func(new RegisterPciAudioRecording(), ['0.2.3']);
            call_user_func(new RegisterPciLikertScale(), ['0.4.1']);
            call_user_func(new RegisterPciLiquid(), ['0.3.1']);
            call_user_func(new RegisterPciMathEntry(), ['0.7.1']);
            $this->setVersion('4.0.1');
        }

        $this->skip('4.0.1', '4.4.1');

        if($this->isVersion('4.4.1')){
            call_user_func(new RegisterPciAudioRecording(), ['0.3.0']);
            $this->setVersion('4.5.0');
        }

        if($this->isVersion('4.5.0')){
            call_user_func(new RegisterPciAudioRecording(), ['0.3.1']);
            $this->setVersion('4.5.1');
        }

        if($this->isVersion('4.5.1')){
            call_user_func(new RegisterPciMathEntry(), ['0.7.2']);
            $this->setVersion('4.5.2');
        }

        if($this->isVersion('4.5.2')){
            call_user_func(new RegisterPciLikertScale(), ['0.5.0']);
            call_user_func(new RegisterPciMathEntry(), ['0.8.0']);
            call_user_func(new RegisterPciLiquid(), ['0.4.0']);
            call_user_func(new RegisterPciAudioRecording(), ['0.4.0']);
            $this->setVersion('4.6.0');
        }
        $this->skip('4.6.0', '4.6.5');

        if ($this->isVersion('4.6.5')) {
            call_user_func(new RegisterPciAudioRecording(), ['0.5.0']);
            $this->setVersion('4.7.0');
        }

        $this->skip('4.7.0', '4.7.1');

        if ($this->isVersion('4.7.1')) {
            call_user_func(new RegisterPciAudioRecording(), ['0.6.0']);
            $this->setVersion('4.8.0');
        }

        if ($this->isVersion('4.8.0')) {
            call_user_func(new RegisterPciAudioRecording(), ['0.7.0']);
            $this->setVersion('4.9.0');
        }

        if ($this->isVersion('4.9.0')) {
            call_user_func(new RegisterPciAudioRecording(), ['0.7.1']);
            $this->setVersion('4.9.1');
        }

        if ($this->isVersion('4.9.1')) {
            call_user_func(new RegisterPciAudioRecording(), ['0.9.0']);
            $this->setVersion('4.10.0');
        }

        $this->skip('4.10.0', '4.10.1');
    }
}
