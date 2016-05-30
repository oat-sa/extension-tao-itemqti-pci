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

use oat\qtiItemPci\model\PciValidator as Validator;

class PciModel
{
    /** @var string */
    protected $typeIdentifier;
    /** @var string */
    protected $label;
    /** @var string */
    protected $short;
    /** @var string */
    protected $description;
    /** @var string */
    protected $version;
    /** @var string */
    protected $author;
    /** @var string */
    protected $email;

    /** @var array */
    protected $tags = array();
    /** @var array */
    protected $response = array();
    /** @var array */
    protected $runtime = array(
        'libraries' => [],
        'stylesheets' => [],
        'mediaFiles' => [],
    );
    /** @var array */
    protected $creator = array();

    public function exchangeArray(array $data)
    {
        $attributes = array_keys($this->toArray());
        foreach ($attributes as $field) {
            if (isset($data[$field])) {
                $this->$field = $data[$field];
            }
        }
        return $this;
    }

    public function toArray()
    {
        return get_object_vars($this);
    }

    public function getConstraints()
    {
        return [
            'typeIdentifier' => [Validator::AlphaNum, Validator::NotEmpty],
            'short'          => [Validator::isString, Validator::NotEmpty],
            'description'    => [Validator::isString, Validator::NotEmpty],
            'version'        => [Validator::isVersion, Validator::NotEmpty],
            'author'         => [Validator::isString, Validator::NotEmpty],
            'email'          => [Validator::Email, Validator::NotEmpty],
            'tags'           => [Validator::isArray, Validator::NotEmpty],
            'response'       => [Validator::isArray, Validator::NotEmpty],
            'runtime'        => [Validator::isArray, Validator::NotEmpty],
            'creator'        => [Validator::isArray, Validator::NotEmpty]
        ];
    }
    
    /**
     * @return string
     */
    public function getTypeIdentifier()
    {
        return $this->typeIdentifier;
    }

    /**
     * @param $typeIdentifier
     * @return $this
     */
    public function setTypeIdentifier($typeIdentifier)
    {
        $this->typeIdentifier = $typeIdentifier;
        return $this;
    }

    /**
     * @return string
     */
    public function getLabel()
    {
        return $this->label;
    }

    /**
     * @param $label
     * @return $this
     */
    public function setLabel($label)
    {
        $this->label = $label;
        return $this;
    }

    /**
     * @return string
     */
    public function getShort()
    {
        return $this->short;
    }

    /**
     * @param $short
     * @return $this
     */
    public function setShort($short)
    {
        $this->short = $short;
        return $this;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @param $description
     * @return $this
     */
    public function setDescription($description)
    {
        $this->description = $description;
        return $this;
    }

    /**
     * @return string
     */
    public function getVersion()
    {
        return $this->version;
    }

    /**
     * @param $version
     * @return $this
     */
    public function setVersion($version)
    {
        $this->version = $version;
        return $this;
    }

    /**
     * @return string
     */
    public function getAuthor()
    {
        return $this->author;
    }

    /**
     * @param $author
     * @return $this
     */
    public function setAuthor($author)
    {
        $this->author = $author;
        return $this;
    }

    /**
     * @return string
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * @param $email
     * @return $this
     */
    public function setEmail($email)
    {
        $this->email = $email;
        return $this;
    }

    /**
     * @return array
     */
    public function getTags()
    {
        return $this->tags;
    }

    /**
     * @param $tags
     * @return $this
     */
    public function setTags($tags)
    {
        $this->tags = $tags;
        return $this;
    }

    /**
     * @return array
     */
    public function getResponse()
    {
        return $this->response;
    }

    /**
     * @param $response
     * @return $this
     */
    public function setResponse($response)
    {
        $this->response = $response;
        return $this;
    }

    /**
     * @return array
     */
    public function getRuntime()
    {
        return $this->runtime;
    }

    /**
     * @param array $runtime
     * @return $this
     */
    public function setRuntime(array $runtime)
    {
        foreach ($runtime as $key => $value) {
            if (is_array($value)) {
                $this->runtime[$key] = $value;
            }
        }
        return $this;
    }

    public function getRuntimeFiles()
    {
        $files = [];
        foreach ($this->runtime as $key => $value) {
            if (is_array($value)) {
                array_merge($files, $value);
            }
        }
        return $files;
    }

    /**
     * @return array
     */
    public function getCreator()
    {
        return $this->creator;
    }

    /**
     * @param $creator
     * @return $this
     */
    public function setCreator($creator)
    {
        $this->creator = $creator;
        return $this;
    }
}