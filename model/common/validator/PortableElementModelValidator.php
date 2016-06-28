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

namespace oat\qtiItemPci\model\common\validator;

class PortableElementModelValidator extends PortableElementAssetValidator
{
    protected $assetConstraints = [
        'runtime' => [
            'hook',
            'libraries',
            'stylesheets',
            'mediaFiles',
        ]
    ];

    protected $optional = [
        'runtime' => [
            'stylesheets',
            'mediaFiles',
        ]
    ];

    public function getConstraints()
    {
        return [
            'typeIdentifier' => [ Validator::AlphaNum, Validator::NotEmpty ],
            'short'          => [ Validator::isString, Validator::NotEmpty ],
            'description'    => [ Validator::isString, Validator::NotEmpty ],
            'version'        => [ Validator::isVersion, Validator::NotEmpty ],
            'author'         => [ Validator::isString, Validator::NotEmpty ],
            'email'          => [ Validator::Email, Validator::NotEmpty ],
            'tags'           => [ Validator::isArray, Validator::NotEmpty ],
            'runtime'        => [ Validator::NotEmpty, Validator::isArray ],
        ];
    }

    public function getAssetConstraints($key)
    {
        if (!isset($this->assetConstraints[$key])) {
            return [];
        }
        return $this->assetConstraints[$key];
    }

    public function isOptionalConstraint($key, $constraint)
    {
        return in_array($constraint, $this->optional[$key]);
    }
}