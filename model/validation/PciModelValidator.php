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

namespace oat\qtiItemPci\model\validation;

use oat\qtiItemPci\model\PciModel;
use oat\qtiItemPci\model\validation\PciValidator as Validator;
use oat\tao\model\ClientLibRegistry;

class PciModelValidator implements Validatable
{
    protected $model;

    public function __construct(PciModel $pciModel=null)
    {
        if ($pciModel) {
            $this->setModel($pciModel);
        }
    }

    /**
     * @return PciModel
     */
    public function getModel()
    {
        return $this->model;
    }

    /**
     * @param PciModel $pciModel
     * @return PciModel
     */
    public function setModel(PciModel $pciModel)
    {
        return $this->model = $pciModel;
    }

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
            'response'       => [ Validator::isArray, Validator::NotEmpty ],
            'runtime'        => [ Validator::NotEmpty, Validator::isArray ],
            'creator'        => [ Validator::isArray ],
        ];
    }

    protected function getAssetConstraints($key)
    {
        $constraints = [
            'runtime' => [
                'hook',
                'libraries',
                'stylesheets',
                'mediaFiles',
            ],
            'creator' => [
                'icon',
                'hook',
                'libraries',
                'stylesheets',
                'mediaFiles',
            ]
        ];
        if (!isset($constraints[$key])) {
            return [];
        }
        return $constraints[$key];
    }

    public function isOptionalConstraint($key, $constraint)
    {
        $optional =  [
            'creator' => [
                'stylesheets',
                'mediaFiles',
            ]
        ];
        return in_array($constraint, $optional[$key]);
    }

    public function validateAssets($source, $files=null)
    {
        if (!$files) {
            $files = $this->getRequiredAssets();
        }

        if (empty($files)) {
            return false;
        }

        foreach ($files as $key => $file) {
            try {
                $this->validFile($source, $file);
            } catch (\common_Exception $e) {
                throw new \common_Exception('Invalid file for ' . $key . ': ' . $file, 0, $e);
            }
        }
        return true;
    }

    public function getRequiredAssets()
    {
        $assets = ['runtime' => $this->getModel()->getRuntime()];
        if (!empty($this->getModel()->getCreator())) {
            $assets['creator'] = $this->getModel()->getCreator();
        }

        $files = [];
        foreach ($assets as $key => $asset) {
            $constraints = $this->getAssetConstraints($key);
            foreach ($constraints as $constraint) {
                if (!isset($asset[$constraint])) {
                    if ($this->isOptionalConstraint($key, $constraint)) {
                        continue;
                    }
                    throw new \common_Exception('Missing asset file for ' . $key . ':' . $constraint);
                }
                if (is_array($asset[$constraint])) {
                    $files = array_merge($files, $asset[$constraint]);
                } else {
                    $files[] = $asset[$constraint];
                }
            }
        }
        return $files;
    }

    public function validFile($source, $file)
    {
        if (!file_exists($source)) {
            throw new \common_Exception('Unable to locate extracted zip file.');
        }

        $filePath = $source . $file;
        if (file_exists($filePath)) {
            return true;
        }

        if (array_key_exists($file, ClientLibRegistry::getRegistry()->getLibAliasMap())) {
            return true;
        }
        throw new \common_Exception('Asset ' . $file . ' is not found in archive neither through alias');
    }
}