<?php

namespace oat\qtiItemPci\model\common\parser;

use oat\qtiItemPci\model\common\model\PortableElementModel;
use oat\qtiItemPci\model\common\PortableElementModelTrait;
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
