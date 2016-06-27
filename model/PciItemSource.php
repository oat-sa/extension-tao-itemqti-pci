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

namespace oat\qtiItemPci\model;

use oat\taoQtiItem\model\qti\Item;

class PciItemSource
{
    /**
     * @var Item
     */
    protected $qtiModel;

    /**
     * Handle pci import process for a file
     *
     * @todo
     *
     * @param $absolutePath
     * @param $relativePath
     * @return array
     */
    public function importPciFile($absolutePath, $relativePath)
    {
        $pciXml = $this->getPciElements($this->getQtiModel());
        $assetFileInPackage = $relativePath;

        // Convert $pciXml to pci model
        // import into registry
        // Alter qti xml to pci xinclude // Asked by Joël
        // Be warning to remove qti file only used by PCI

        return $this->getFileInfo($absolutePath, $relativePath);
    }

    /**
     * Check if Item is a PCI
     *
     * @param Item $item
     * @return bool
     */
    public function isPci(Item $item)
    {
        return ($this->getPciElements($item) > 0);
    }

    /**
     * Extract PCI from $item
     *
     * @param Item $item
     * @return \DOMNodeList|string
     * @throws \oat\taoQtiItem\model\qti\exception\QtiModelException
     */
    public function getPciElements(Item $item)
    {
        /**
         * Warning foreach file, xml will be parsed, performance issues is coming
         * Sam do u have method like getComposingElementFromCache? Otherwise, a singleton should be good
         */
        return $item->getComposingElements('oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction');
    }

    /**
     * Check if file is required by PCI
     *
     * @todo
     */
    public function isPciAsset($file)
    {
        return false;
    }

    /**
     * Get details about file
     *
     * @param $path
     * @param $relPath
     * @return array
     * @throws \tao_models_classes_FileNotFoundException
     */
    public function getFileInfo($path, $relPath) {

        if (file_exists($path)) {
            return array(
                'name' => basename($path),
                'uri' => $relPath,
                'mime' => \tao_helpers_File::getMimeType($path),
                'filePath' => $path,
                'size' => filesize($path),
            );
        }

        throw new \tao_models_classes_FileNotFoundException($path);
    }

    /**
     * @return Item
     */
    public function getQtiModel()
    {
        return $this->qtiModel;
    }

    /**
     * @param Item $qtiModel
     */
    public function setQtiModel($qtiModel)
    {
        $this->qtiModel = $qtiModel;
    }
}