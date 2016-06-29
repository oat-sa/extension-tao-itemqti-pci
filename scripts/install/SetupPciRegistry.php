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
namespace oat\qtiItemPci\scripts\install;

use oat\qtiItemPci\model\common\PortableElementFactory;
use oat\qtiItemPci\model\PortableElementRegistry;
use oat\tao\model\websource\TokenWebSource;
use oat\oatbox\filesystem\FileSystemService;
/*
 * This post-installation script creates a new local file source for file uploaded
 * by end-users through the TAO GUI.
 */
class SetupPciRegistry extends \common_ext_action_InstallAction
{
    public function __invoke($params)
    {
        $pciPublicFs = \tao_models_classes_FileSourceService::singleton()->addLocalSource(
            'pci storage',
            FILES_PATH.'qtiItemPci'.DIRECTORY_SEPARATOR.'pciRegistry'.DIRECTORY_SEPARATOR
        );

        $picPublicFs = \tao_models_classes_FileSourceService::singleton()->addLocalSource(
            'pic storage',
            FILES_PATH.'qtiItemPci'.DIRECTORY_SEPARATOR.'picRegistry'.DIRECTORY_SEPARATOR
        );

        $pciWebsource = $websource = TokenWebSource::spawnWebsource($pciPublicFs);
        $picWebsource = $websource = TokenWebSource::spawnWebsource($picPublicFs);

        $portableElementRegistries = new PortableElementFactory(array(
            PortableElementFactory::PCI_IMPLEMENTATION => new PortableElementRegistry(array(
                PortableElementRegistry::OPTION_FS => $pciPublicFs->getUri(),
                PortableElementRegistry::OPTION_WEBSOURCE => $pciWebsource->getId(),
                PortableElementRegistry::OPTION_STORAGE => 'qtiItemPci/pciRegistry',
                PortableElementRegistry::OPTION_REGISTRY => 'pciRegistryEntries'
            )),
            PortableElementFactory::PIC_IMPLEMENTATION => new PortableElementRegistry(array(
                PortableElementRegistry::OPTION_FS => $picPublicFs->getUri(),
                PortableElementRegistry::OPTION_WEBSOURCE => $picWebsource->getId(),
                PortableElementRegistry::OPTION_STORAGE => 'qtiItemPci/picRegistry',
                PortableElementRegistry::OPTION_REGISTRY => 'picRegistryEntries'
            ))
        ));

        $this->getServiceManager()->register(PortableElementFactory::SERVICE_ID, $portableElementRegistries);
    }
    
    protected function setupFs()
    {
        $fsm = $this->getServiceManager()->get(FileSystemService::SERVICE_ID);
        $fsm->registerLocalFileSystem('pciRegistry', FILES_PATH.'qtiItemPci'.DIRECTORY_SEPARATOR.'pciRegistry'.DIRECTORY_SEPARATOR);
        $this->getServiceManager()->register(FileSystemService::SERVICE_ID, $fsm);
    }
    
}