<?php

namespace oat\qtiItemPci\model\common\resolver;

use oat\tao\model\media\TaoMediaResolver;

class PortableElementResolver extends TaoMediaResolver
{
    public function resolve($url)
    {
        // if pci file ???
        // return object to know which path has to be applied

        return parent::resolve($url);
    }

}