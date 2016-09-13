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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\qtiItemPci\model\portableElement\dataObject;

use oat\taoQtiItem\model\portableElement\element\PortableElementObject;

class PciDataObject extends PortableElementObject
{
    /** @var array */
    protected $response = array();
    /** @var array */
    protected $creator = array();

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
        foreach ($creator as $key => $value) {
            if (is_array($value)) {
                $this->creator[$key] = $value;
            }
        }
        return $this;
    }

    /**
     * Check if given creator key exists
     *
     * @param $key
     * @return bool
     */
    public function hasCreatorKey($key)
    {
        return (isset($this->creator[$key]));
    }

    /**
     * Get creator value associated to the given key
     *
     * @param $key
     * @return null
     */
    public function getCreatorKey($key)
    {
        if ($this->hasCreatorKey($key)) {
            return $this->creator[$key];
        }
        return null;
    }

    /**
     * Set creator value associated to the given key
     *
     * @param $key
     * @param $value
     * @return mixed
     */
    public function setCreatorKey($key, $value)
    {
        return $this->creator[$key] = $value;
    }
}