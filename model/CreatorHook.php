<?php
/*  
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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 * 
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *               
 * 
 */

namespace oat\qtiItemPci\model;

use oat\taoQtiItem\model\Hook;
use oat\taoQtiItem\model\Config;
use oat\qtiItemPci\model\CreatorHook;

/**
 * The hook used in the item creator
 *
 * @package qtiItemPci
 */
class CreatorHook implements Hook
{
    /**
     * Affect the config
     * 
     * @param \oat\qtiItemPci\model\Config $config
     */
    public function init(Config $config){
        
        //get list of all authorable interactions :
        $interactions = array();
        
        //get registered PCI
        
        $config->addInteraction($interactions);
        
    }
}