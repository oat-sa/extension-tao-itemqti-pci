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

use oat\tao\model\websource\TokenWebSource;
use oat\oatbox\service\ServiceManager;
use oat\qtiItemPci\model\PciRegistry;
use oat\oatbox\filesystem\FileSystemService;
/*
 * This post-installation script creates a new local file source for file uploaded
 * by end-users through the TAO GUI.
 */
class SetupPciRegistry extends \common_ext_action_InstallAction
{
    public function __invoke($params)
    {
        $publicFs = \tao_models_classes_FileSourceService::singleton()->addLocalSource(
            'pci storage',
            FILES_PATH.'qtiItemPci'.DIRECTORY_SEPARATOR.'pciRegistry'.DIRECTORY_SEPARATOR
        );
        
        $websource = TokenWebSource::spawnWebsource($publicFs);
        $pciRegistry = new PciRegistry(array(
            PciRegistry::OPTION_FS => $publicFs->getUri(),
            PciRegistry::OPTION_WEBSOURCE => $websource->getId(),
        ));
        
        $this->getServiceManager()->register(PciRegistry::SERVICE_ID, $pciRegistry);
    }
    
    protected function setupFs()
    {
        $fsm = $this->getServiceManager()->get(FileSystemService::SERVICE_ID);
        $fsm->registerLocalFileSystem('pciRegistry', FILES_PATH.'qtiItemPci'.DIRECTORY_SEPARATOR.'pciRegistry'.DIRECTORY_SEPARATOR);
        $this->getServiceManager()->register(FileSystemService::SERVICE_ID, $fsm);
    }
    
}