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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA;
 * 
 */

namespace oat\qtiItemPci\helpers;

use \core_kernel_classes_Resource;
use \tao_helpers_File;
use \taoItems_models_classes_ItemsService;
use \common_exception_Error;
use oat\qtiItemPci\model\CreatorRegistry;

/**
 * Helpers to create pci
 *
 * @package qtiItemPci
 */
class Creator
{
    
    public static function addRequiredResources($typeIdentifier, core_kernel_classes_Resource $item, $lang){
        
        $returnValue = array();
        
        $registry = CreatorRegistry::singleton();
        $folder = taoItems_models_classes_ItemsService::singleton()->getItemFolder($item, $lang);
        $interaction = $registry->get($typeIdentifier);
        
        if(is_null($interaction)){
            $interaction = $registry->getDevInteraction($typeIdentifier);
        }
        if(is_null($interaction)){
            throw new common_exception_Error('no pci found with the type identifier '.$typeIdentifier);
        }
        
        $directory = $interaction['directory'];
        $manifest = $interaction['manifest'];
        $required = array($manifest['entryPoint']);
        if(isset($manifest['libraries'])){
            $required = array_merge($required, array_values($manifest['libraries']));
        }
        if(isset($manifest['css'])){
            $required = array_merge($required, array_values($manifest['css']));
        }
        
        foreach($required as $relPath){
            if(tao_helpers_File::securityCheck($relPath, true)){
                
                $source = $directory.$relPath;
                $destination = $folder.$relPath;
                
                if(tao_helpers_File::copy($source, $destination)){
                    $returnValue[] = $relPath;
                }else{
                    throw new common_exception_Error('the resource cannot be moved');
                }
            }else{
                throw new common_exception_Error('invalid item preview file path');
            }
        }
        
        return $returnValue;
    }
    
}