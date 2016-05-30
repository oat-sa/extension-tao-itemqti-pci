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

namespace oat\qtiItemPci\model;

use oat\taoQtiItem\model\qti\exception\ExtractException;
use oat\taoQtiItem\model\qti\PackageParser;
use oat\taoQtiItem\helpers\QtiPackage;
use common_Exception;
use \ZipArchive;

/**
 * Parser of a QTI PCI package
 * A PCI package must contain a manifest pciCreator.json in the root as well as a pciCreator.js creator file
 *
 * @package qtiItemPci
 */
class PciPackageParser extends PackageParser
{
    const PCI_MANIFEST = 'pciCreator.json';
    const PCI_ENGINE   = 'pciCreator.js';

    /**
     * Validate the zip package
     *
     * @param string $schema
     * @return bool
     * @throws common_Exception
     */
    public function validate($schema = '')
    {
        if (!QtiPackage::isValidZip($this->source)) {
            throw new common_Exception('Source package is not a valiad zip.');
        }

        $zip = new ZipArchive();
        $zip->open($this->source, ZIPARCHIVE::CHECKCONS);

        if ($zip->locateName(self::PCI_MANIFEST) === false) {
            throw new common_Exception('A PCI creator package must contains a ' . self::PCI_MANIFEST . ' file at the root of the archive');
        }

        if($zip->locateName(self::PCI_ENGINE) === false) {
            throw new common_Exception('A PCI creator package must contains a ' . self::PCI_ENGINE . ' file at the root of the archive');
        }

        return true;
    }

    /**
     * Get the manifest as Pci Model from the source zip package
     *
     * @return PciModel
     * @throws common_Exception
     */
    public function getPciModel()
    {
        if (($handle = fopen('zip://' . $this->source . '#' . self::PCI_MANIFEST, 'r')) === false) {
            throw new common_Exception('Unable to open the ZIP file located at: ' . $this->source);
        }

        $content = '';
        while(!feof($handle)){
            $content .= fread($handle, 8192);
        }
        fclose($handle);

        $pciModel = new PciModel();
        return $pciModel->exchangeArray(json_decode($content, true));
    }

    /**
     * Extract zip package into temp directory
     *
     * @return string Name of source directory
     * @throws ExtractException
     * @throws \common_exception_Error
     */
    public function extract()
    {
        $source = parent::extract();
        if(!is_dir($source)){
            throw new ExtractException('Unable to find a valid directory of extracted package.');
        }
        return $source;
    }
}