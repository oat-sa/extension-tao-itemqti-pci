<?php
/**
 * Created by PhpStorm.
 * User: siwane
 * Date: 27/06/2016
 * Time: 10:30
 */

namespace oat\qtiItemPci\model;

use oat\qtiItemPci\model\common\model\PortableElementModel;
use oat\qtiItemPci\model\common\parser\PortableElementPackageParser;
use oat\qtiItemPci\model\common\validator\PortableElementModelValidator;
use oat\qtiItemPci\model\pci\validator\PciValidator;
use oat\qtiItemPci\model\pic\model\PicModel;
use oat\qtiItemPci\model\pci\model\PciModel;
use oat\qtiItemPci\model\pic\validator\PicValidator;

class PortableElementFactory
{
    static protected function getAvailableModels()
    {
        return [
            new PciModel(),
            new PicModel()
        ];
    }

    static public function getPackageParser($source, PortableElementModel $forceModel=null)
    {
        $parser = new PortableElementPackageParser($source);
        $models = self::getAvailableModels();

        if ($forceModel) {
            return $parser->hasValidModel($forceModel);
        }

        foreach ($models as $model) {
            if ($parser->hasValidModel($model)) {
                return $parser;
            }
        }

        throw new \common_Exception('This zip source is not compatible neither with PCI or PIC model. Manifest and/or engine file are missing.');
    }

    static public function getValidator(PortableElementModel $model)
    {
        switch (get_class($model)) {
            case PciModel::class :
                $validator = new PciValidator();
                break;
            case PicModel::class :
                $validator = new PicValidator();
                break;
            default:
                $validator = new PortableElementModelValidator();
                break;
        }
        return $validator->setModel($model);
    }
}