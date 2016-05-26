<?php
/*
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
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;
use common_Exception;
use \ZipArchive;

/**
 * Parser of a QTI PCI package
 * A PCI package must contain a manifest pciCreator.json in the root as well as a pciCreator.js creator file
 *
 * @package qtiItemPci
 */
class PciPackageParser extends PackageParser implements ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;

    const PCI_MANIFEST = 'pciCreator.json';

    const PCI_ENGINE = 'pciCreator.js';

    /**
     * @var PciRegistry
     */
    protected $registry;

    /**
     * Singleton of registry service
     * @return PciRegistry
     */
    protected function getRegistry()
    {
        if (!$this->registry) {
            $this->registry = $this->getServiceLocator()->get(PciRegistry::SERVICE_ID);
        }
        return $this->registry;
    }

    /**
     * Validate the zip package
     *
     * @access public
     * @param  string schema
     * @return boolean
     */
    public function validate($schema = ''){

        $this->valid = false;

        try{

            if(QtiPackage::isValidZip($this->source)){

                $zip = new ZipArchive();
                $zip->open($this->source, ZIPARCHIVE::CHECKCONS);
                if ($zip->locateName(self::PCI_MANIFEST) === false) {
                    echo '1';
                    throw new common_Exception('A PCI creator package must contains a ' . self::PCI_MANIFEST . ' file at the root of the archive');
                } elseif($zip->locateName(self::PCI_ENGINE) === false) {
                    throw new common_Exception('A PCI creator package must contains a ' . self::PCI_ENGINE . ' file at the root of the archive');
                } else {
                    //check manifest format :
                    $manifest = $this->getManifest();
                    $this->valid = $this->validateManifest($manifest);
                }

                $zip->close();
            }
            
        }catch(common_Exception $e){
            $this->addError($e);
        }
    }
    
    /**
     * Validate the manifest pciCreator.json
     * 
     * @param array $manifest
     * @return boolean
     * @throws common_Exception
     */
    protected function validateManifest($manifest){

        $isValid = true;

        $requiredEntries = array(
            'typeIdentifier' => 'identifier',
            'label' => 'string',
            'short' => 'string',
            'description' => 'string',
            'version' => 'string',
            'author' => 'string',
            'email' => 'string',
            'tags' => 'array',
            'response' => 'array',
            'runtime' => 'array',
            'creator' => 'array'
        );

        $zip = new ZipArchive();
        $zip->open($this->source, ZIPARCHIVE::CHECKCONS);

        foreach ($requiredEntries as $entry => $type) {
            //@todo : implement more generic data validation ?
            try {
                if (!isset($manifest[$entry])) {
                    throw new common_Exception('Missing required attribute in the manifest ' . self::PCI_MANIFEST . ' : "'.$entry.'"');
                }

                $value = $manifest[$entry];
                switch ($type) {
                    case 'identifier':
                    case 'string':
                        if (!is_string($value)) {
                            throw new common_Exception('Invalid attribute format in the manifest ' . self::PCI_MANIFEST . ' : ' .
                                '"'.$entry.'" (expected a string)');
                        }
                        break;
                    case 'array':
                        if (!is_array($value)) {
                            throw new common_Exception('Invalid attribute format in the manifest ' . self::PCI_MANIFEST . ' : ' .
                                '"'.$entry.'" (expected an array)');
                        }
                        break;
                    case 'file':
                        if ($zip->locateName(preg_replace('/^\.\//', '', $value)) === false) {
                            throw new common_Exception('cannot locate "'.$entry.'" file : "'.$value.'"');
                        }
                        break;
                }
            } catch (common_Exception $e) {
                \common_Logger::e('Invalid PCI manifest: ' . $e->getMessage());
                $isValid = false;
                break;
            }
        }
        $zip->close();
        return $isValid;
    }

    /**
     * Get the manifest as an associative array from the source zip package
     *
     * @return mixed
     * @throws common_Exception
     */
    public function getManifest()
    {
        if (($handle = fopen('zip://' . $this->source . '#' . self::PCI_MANIFEST, 'r')) === false) {
            throw new common_Exception('Unable to open the ZIP file located at: '. $this->source);
        }

        $str = '';
        while(!feof($handle)){
            $str .= fread($handle, 8192);
        }
        fclose($handle);

        $returnValue = json_decode($str, true);

        return $returnValue;
    }

    /**
     * Import a PCI package from temp to registry
     * If override is true, remove old PCI if exists
     *
     * @param bool $override
     * @return mixed
     * @throws ExtractException
     * @throws \common_exception_Error
     * @throws common_Exception
     */
    public function import($override=false)
    {
        $this->validate();
        if (!$this->isValid()) {
            throw new common_Exception('Invalid PCI creator package format');
        }

        $registry = $this->getRegistry();

        //obtain the id from manifest file
        $manifest = $this->getManifest();
        $typeIdentifier = $manifest['typeIdentifier'];
        $version = $manifest['version'];

        //check if such PCI creator already exists
        if ($registry->exists($typeIdentifier, $version)) {
            if ($override) {
                $registry->unregister($typeIdentifier, $version);
            } else {
                throw new common_Exception('The Creator Package already exists');
            }
        }

        //extract the package
        $temp = $this->extract();
        if(!is_dir($temp)){
            throw new ExtractException();
        }
        $this->registry->setTempDirectory($temp);

        $runtime = $manifest['runtime'];
        $creator = $manifest['creator'];
        if (!isset($creator['manifest'])) {
            $creator['manifest'] = '.' . DIRECTORY_SEPARATOR . self::PCI_MANIFEST;
        }

        $registry->register($typeIdentifier, $version, $runtime, $creator);

        \tao_helpers_File::delTree($temp);

        return $registry->get($typeIdentifier);
    }
}