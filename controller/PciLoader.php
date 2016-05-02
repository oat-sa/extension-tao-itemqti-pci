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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\qtiItemPci\controller;

use oat\qtiItemPci\model\PciRegistry;
use \tao_actions_CommonModule;

class PciLoader extends tao_actions_CommonModule
{
    public function __construct(){
        $this->registry = \oat\oatbox\service\ServiceManager::getServiceManager()->get(PciRegistry::SERVICE_ID);
    }
    
    public function load(){
        $pcis = $this->registry->getAllLatest();
        foreach($pcis as $typeIdentifier => &$versions){
            foreach($versions as &$files){
                $hook = reset(array_keys($files['hook']));
                $files['hook'] = $typeIdentifier.'/'.$hook;
                $files['libs'] = array_map(function($v) use ($typeIdentifier) {
                    return $typeIdentifier.'/'.$v;
                }, array_keys($files['libs']));
                $files['stylesheets'] = array_map(function($v) use ($typeIdentifier) {
                    return $typeIdentifier.'/'.$v;
                }, array_keys($files['stylesheets']));
                $files['mediaFiles'] = array_map(function($v) use ($typeIdentifier) {
                    return $typeIdentifier.'/'.$v;
                }, array_keys($files['mediaFiles']));
            }
        }
        $this->returnJson($pcis);
    }
    
}