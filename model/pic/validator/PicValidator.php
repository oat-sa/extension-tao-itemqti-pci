<?php

namespace oat\qtiItemPci\model\pic\validator;

use oat\qtiItemPci\model\common\validator\PortableElementModelValidator;

class PicValidator extends PortableElementModelValidator
{
    public function isOptionalConstraint($key, $constraint)
    {
        array_push($this->optional['creator'], 'hook');
        return parent::isOptionalConstraint($key, $constraint);
    }
}