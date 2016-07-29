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

use League\Flysystem\Adapter\Local;
use oat\oatbox\filesystem\FileSystemService;
use oat\tao\model\websource\FlyTokenWebSource;
use oat\tao\model\websource\TokenWebSource;
use oat\taoQtiItem\model\portableElement\PortableElementFileStorage;

/*
 * This post-installation script creates a new local file source for file uploaded
 * by end-users through the TAO GUI.
 */
class SetupPciRegistry extends \common_ext_action_InstallAction
{
    /**
     * Install script
     */
    public function __invoke($params)
    {
        return $this->updateTo1_0_0();
    }

    /**
     * Update script
     *
     * Don't touch it, it used by updater
     * If you want to change create your update method
     */
    public function updateTo1_0_0()
    {
        if ($this->getServiceLocator()->has(PortableElementFileStorage::SERVICE_ID)) {
            return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'Portable file storage already registered, skipped.');
        }

        $fsm = $this->getServiceLocator()->get(FileSystemService::SERVICE_ID);
        $fsPci = $fsm->createFileSystem('portableElementRegistry', 'portableElement');

        if ($fsPci->getAdapter() instanceof Local) {
            $websource = TokenWebSource::spawnWebsource('portableElementRegistry', $fsPci->getAdapter()->getPathPrefix());
        } else {
            $websource = FlyTokenWebSource::spawnWebsource('portableElementRegistry','');
        }

        $portableElementStorage = new PortableElementFileStorage(array(
            PortableElementFileStorage::OPTION_FILESYSTEM => 'portableElementRegistry',
            PortableElementFileStorage::OPTION_WEBSOURCE => $websource->getId()
        ));

        $this->getServiceManager()->register(PortableElementFileStorage::SERVICE_ID, $portableElementStorage);
        $this->getServiceLocator()->register(FileSystemService::SERVICE_ID, $fsm);

        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'Portable file storage registered.');
    }

}