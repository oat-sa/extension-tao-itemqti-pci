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

namespace oat\qtiItemPci\model\pic\model;

use oat\qtiItemPci\model\common\model\PortableElementModel;

class PicModel extends PortableElementModel
{
    const PIC_MANIFEST = 'picCreator.json';
    const PIC_ENGINE = 'picCreator.js';

    public function getDefinitionFiles()
    {
        return [
            self::PIC_MANIFEST,
            self::PIC_ENGINE
        ];
    }

    public function getManifestName()
    {
        return self::PIC_MANIFEST;
    }
}