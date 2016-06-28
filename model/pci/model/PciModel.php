<?php

namespace oat\qtiItemPci\model\pci\model;

use oat\qtiItemPci\model\common\model\PortableElementModel;

class PciModel extends PortableElementModel
{
    const PCI_MANIFEST = 'pciCreator.json';
    const PCI_ENGINE = 'pciCreator.js';

    /** @var array */
    protected $response = array();
    /** @var array */
    protected $creator = array();

    public function getDefinitionFiles()
    {
        return [
            self::PCI_MANIFEST,
            self::PCI_ENGINE
        ];
    }

    public function getManifestName()
    {
        return self::PCI_MANIFEST;
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