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

class Validator
{
    const NotEmpty         = 'NotEmpty';
    const AlphaNum         = 'AlphaNum';
    const Callback         = 'Callback';
    const DateTime         = 'DateTime';
    const Email            = 'Email';
    const Equals           = 'Equals';
    const FileMimeType     = 'FileMimeType';
    const FileName         = 'FileName';
    const FileSize         = 'FileSize';
    const IndexIdentifier  = 'IndexIdentifier';
    const Integer          = 'Integer';
    const Length           = 'Length';
    const Numeric          = 'Numeric';
    const Password         = 'Password';
    const PasswordStrength = 'PasswordStrength';
    const Regex            = 'Regex';
    const Unique           = 'Unique';
    const Url              = 'Url';
    const isArray          = 'isArray';
    const isString         = 'isString';
    const isVersion        = 'isVersion';

    protected static $customValidators = [
        self::isArray        => 'isValidArray',
        self::isString       => 'isValidString',
        self::isVersion      => 'isValidVersion'
    ];

    protected static function getValidConstraints(array $requirements, $validationGroup=array())
    {
        $validConstraints = [];

        foreach ($requirements as $field => $constraints) {

            if (!empty($validationGroup) && !in_array($field, $validationGroup)) {
                continue;
            }

            if (is_array($constraints)) {
                $validators = $constraints;
            } else {
                $validators = explode(',', $constraints);
            }

            foreach ($validators as $validator) {
                if (array_key_exists($validator, self::$customValidators)) {
                    $validConstraints[$field][] = $validator;
                } else {
                    $validConstraints[$field][] = \tao_helpers_form_FormFactory::getValidator($validator);
                }
            }
        }

        return $validConstraints;
    }

    public static function validate(Validatable $validatable, $validationGroup=array())
    {
        $messages = [];
        $constraints = self::getValidConstraints($validatable->getConstraints(), $validationGroup);

        foreach ($constraints as $field => $constraint) {
            foreach ($constraint as $validator) {
                $getter = 'get' . ucfirst($field);
                if (!method_exists($validatable->getModel(), $getter)) {
                    // throw error?
                    continue;
                }
                $value = $validatable->getModel()->$getter();

                if ($validator instanceof \tao_helpers_form_Validator) {
                    if (!$validator->evaluate($value)) {
                        $messages[$field][$validator->getName()] = $validator->getMessage();
                    }
                    continue;
                }

                if (is_string($validator)) {
                    if (array_key_exists($validator, self::$customValidators)) {
                        $callable = self::$customValidators[$validator];
                        try {
                            self::$callable($value);
                        } catch (\common_Exception $e) {
                            $messages[$field][$validator] = $e->getMessage();
                        }
                    }
                    continue;
                }

                return false;
            }
        }

        if (!empty($messages)) {
            return false;
        }
        return true;
    }

    public static function isValidString($value)
    {
        if (!is_string($value)) {
            throw new \common_Exception('Unable to validate the given value as valid string.');
        }
        return true;
    }

    public static function isValidArray($value)
    {
        if (!is_array($value)) {
            throw new \common_Exception('Unable to validate the given value as valid array.');
        }
        return true;
    }

    public static function isValidVersion($value)
    {
        $validator = \tao_helpers_form_FormFactory::getValidator(self::Regex, array('format' => '/\d+(?:\.\d+)+/'));
        if (!$validator->evaluate($value)) {
            throw new \common_Exception('Unable to validate the given value as valid version.');
        }
        return true;
    }
}