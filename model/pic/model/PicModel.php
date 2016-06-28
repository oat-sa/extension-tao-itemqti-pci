<?php

namespace oat\qtiItemPci\model\pic\model;

use oat\qtiItemPci\model\common\model\PortableElementModel;

class PicModel extends PortableElementModel
{
    const PIC_MANIFEST = 'picCreator.json';
    const PIC_ENGINE = 'picCreator.js';

    public function getDefinitionFiles()
    {
        return [
            self::PIC_MANIFEST,
            self::PIC_ENGINE
        ];
    }

    public function getManifestName()
    {
        return self::PIC_MANIFEST;
    }
}