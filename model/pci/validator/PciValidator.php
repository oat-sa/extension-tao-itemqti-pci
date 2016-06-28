<?php
/**
 * Created by PhpStorm.
 * User: siwane
 * Date: 27/06/2016
 * Time: 09:18
 */

namespace oat\qtiItemPci\model\pci\validator;

use oat\qtiItemPci\model\common\validator\PortableElementModelValidator;
use oat\qtiItemPci\model\common\validator\Validator;

class PciValidator extends PortableElementModelValidator
{
    public function getConstraints()
    {
        $pciConstraints = [
            'response' => [ Validator::isArray, Validator::NotEmpty ],
            'creator' => [ Validator::isArray ]
        ];
        return array_merge($pciConstraints, parent::getConstraints());
    }

    public function getAssetConstraints($key)
    {
        $pciConstraints = [
            'creator' => [
                'icon',
                'hook',
                'libraries',
                'stylesheets',
                'mediaFiles',
            ]
        ];

        $this->assetConstraints = array_merge($pciConstraints, $this->assetConstraints);
        return parent::getAssetConstraints($key);
    }

    public function isOptionalConstraint($key, $constraint)
    {
        $optional = [
            'creator' => [
                'stylesheets',
                'mediaFiles',
            ]
        ];

        $this->optional = array_merge($optional, $this->optional);
        return parent::isOptionalConstraint($key, $constraint);
    }

}