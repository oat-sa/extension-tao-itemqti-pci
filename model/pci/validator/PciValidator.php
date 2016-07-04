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

namespace oat\qtiItemPci\model\pci\validator;

use oat\qtiItemPci\model\common\validator\PortableElementModelValidator;
use oat\qtiItemPci\model\common\validator\Validator;

class PciValidator extends PortableElementModelValidator
{
    public function getConstraints()
    {
        $pciConstraints = [
            'response' => [ Validator::isArray, Validator::NotEmpty ],
            'creator' => [ Validator::isArray ]
        ];
        return array_merge($pciConstraints, parent::getConstraints());
    }

    public function getAssetConstraints($key)
    {
        $pciConstraints = [
            'creator' => [
                'icon',
                'hook',
                'libraries',
                'stylesheets',
                'mediaFiles',
            ]
        ];

        $this->assetConstraints = array_merge($pciConstraints, $this->assetConstraints);
        return parent::getAssetConstraints($key);
    }

    public function isOptionalConstraint($key, $constraint)
    {
        $optional = [
            'creator' => [
                'stylesheets',
                'mediaFiles',
            ]
        ];

        $this->optional = array_merge($optional, $this->optional);
        return parent::isOptionalConstraint($key, $constraint);
    }

}