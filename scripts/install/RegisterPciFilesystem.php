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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 *
 *
 */

namespace oat\qtiItemPci\scripts\install;

use oat\oatbox\extension\InstallAction;
use oat\oatbox\filesystem\FileSystemService;
use oat\taoQtiItem\model\flyExporter\simpleExporter\ItemExporter;

/**
 * Create PCI directory
 *
 * Class RegisterPciFilesystem
 * @package oat\qtiItemPci\scripts\install
 */
class RegisterPciFilesystem extends InstallAction
{
    /**
     * Create filesystem for PCI service
     *
     * @param $params
     * @return \common_report_Report
     */
    public function __invoke($params)
    {
        try {
            /** @var FileSystemService $fileSystemService */
            $fileSystemService = $this->getServiceLocator()->get(FileSystemService::SERVICE_ID);
            if (! $fileSystemService->hasDirectory('qtiItemPci')) {
                $fileSystemService->createFileSystem('qtiItemPci');
                $this->registerService(FileSystemService::SERVICE_ID, $fileSystemService);
            }
            if (! $fileSystemService->hasDirectory('qtiItemImsPci')) {
                $fileSystemService->createFileSystem('qtiItemImsPci');
                $this->registerService(FileSystemService::SERVICE_ID, $fileSystemService);
            }
        } catch (\Exception $e) {
            return new \common_report_Report(\common_report_Report::TYPE_ERROR, 'Fail to create pci directory.');
        }

        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'PCI directory created.');
    }
}