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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\qtiItemPci\model\common\parser;

use oat\oatbox\service\ServiceManager;
use oat\qtiItemPci\model\common\PortableElementFactory;
use oat\qtiItemPci\model\common\PortableElementModelTrait;
use oat\qtiItemPci\model\PortableElementRegistry;
use oat\tao\model\media\MediaBrowser;

class PortableElementSource implements MediaBrowser
{
    use PortableElementModelTrait;

    /**
     * @return PortableElementRegistry
     */
    protected function getRegistry()
    {
        return ServiceManager::getServiceManager()
            ->get(PortableElementFactory::SERVICE_ID)
            ->getRegistry($this->getModel());
    }

    public function getFileStream($link)
    {
        $this->getRegistry()->getFileSystem();
    }

    public function getDirectory($parentLink = '/', $acceptableMime = array(), $depth = 1)
    {
        throw new \common_exception_NotImplemented('Portable element item source does not allow the function: ' . __FUNCTION__);
    }

    public function getFileInfo($link)
    {
        throw new \common_exception_NotImplemented('Portable element item source does not allow the function: ' . __FUNCTION__);
    }

    public function download($link)
    {
        throw new \common_exception_NotImplemented('Portable element item source does not allow the function: ' . __FUNCTION__);
    }

    public function getBaseName($link)
    {
        throw new \common_exception_NotImplemented('Portable element item source does not allow the function: ' . __FUNCTION__);
    }
}