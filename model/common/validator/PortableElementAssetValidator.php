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

use oat\qtiItemPci\model\common\model\PortableElementModel;
use oat\qtiItemPci\model\common\PortableElementModelTrait;
use oat\tao\model\ClientLibRegistry;

abstract class PortableElementAssetValidator implements Validatable
{
    use PortableElementModelTrait;

    public function __construct(PortableElementModel $model=null)
    {
        if ($model) {
            $this->setModel($model);
        }
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

    public function getRequiredAssets($type=null)
    {
        $assets = [];
        if (is_null($type) ||($type == 'runtime')) {
            $assets = ['runtime' => $this->getModel()->getRuntime()];
        }

        if (is_null($type) ||($type == 'creator')) {
            if (!empty($this->getModel()->getCreator())) {
                $assets['creator'] = $this->getModel()->getCreator();
            }
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
        if (file_exists($filePath) || file_exists($filePath . '.js')) {
            return true;
        }

        if (array_key_exists($file, ClientLibRegistry::getRegistry()->getLibAliasMap())) {
            return true;
        }
        throw new \common_Exception('Asset ' . $file . ' is not found in archive neither through alias');
    }
}