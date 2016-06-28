<?php

namespace oat\qtiItemPci\model\common;

use oat\qtiItemPci\model\common\model\PortableElementModel;

trait PortableElementModelTrait
{
    /**
     * @var PortableElementModel
     */
    protected $model;

    /**
     * @return PortableElementModel
     */
    public function getModel()
    {
        return $this->model;
    }

    /**
     * @param PortableElementModel $model
     * @return $this
     */
    public function setModel(PortableElementModel $model)
    {
        $this->model = $model;
        return $this;
    }
}