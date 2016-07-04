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

use oat\qtiItemPci\model\common\model\PortableElementModel;
use oat\qtiItemPci\model\common\PortableElementModelTrait;
use oat\taoQtiItem\model\qti\exception\ExtractException;
use common_Exception;

/**
 * Parser of a QTI PCI package
 * A PCI package must contain a manifest pciCreator.json in the root as well as a pciCreator.js creator file
 *
 * @package qtiItemPci
 */
class PortableElementDirectoryParser
{
    use PortableElementModelTrait;

    protected $source = '';

    public function __construct($directory){
        if(!is_dir($directory)){
            throw new ExtractException('Invalid directory');
        }
        $this->source = $directory;
    }

    public function validate()
    {
        $definitionFiles = $this->getModel()->getDefinitionFiles();
        foreach ($definitionFiles as $file) {
            if (!file_exists($this->source . DIRECTORY_SEPARATOR . $file)) {
                throw new common_Exception('A portable element package must contains a "' . $file . '" file at the root of the directory');
            }
        }

        $this->setModel($this->getModel()->exchangeArray($this->getManifestContent()));
        return true;
    }

    public function extract()
    {
        return $this->source;
    }

    public function getManifestContent()
    {
        $content = json_decode(file_get_contents($this->source . DIRECTORY_SEPARATOR . $this->getModel()->getManifestName()), true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $content;
        }
        throw new common_Exception('Portable element manifest is not a valid json file.');
    }

    public function hasValidModel(PortableElementModel $model)
    {
        $this->setModel($model);
        try {
            if ($this->validate()) {
                return true;
            }
        } catch (\common_Exception $e) {}
        return false;
    }
}
