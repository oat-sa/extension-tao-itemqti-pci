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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 * 
 */

namespace oat\qtiItemPci\model;

use oat\taoQtiItem\model\qti\Parser;

/**
 * Enable parsing QTI Item containing PCI interactions and provide way to extract the information
 *
 * @package qtiItemPci
 */
class PciItemParser extends Parser
{

    public function getPciResources(){
        $data = [];
        if($this->validate()){
            
            $item = $this->load(true);
            $pcis = $item->getComposingElements('oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction');

            foreach($pcis as $pci){
                $data[] = [
                    'typeIdentifier' => $pci->getTypeIdentifier(),
                    'version' => $pci->getVersion(),
                    'runtime' => [
                        'hook' => $pci->getEntryPoint(),
                        'libraries' => $pci->getLibraries(),
                        'stylesheets' => $pci->getStylesheets(),
                        'mediaFiles' => $pci->getMediaFiles()
                    ]
                ];
            }
        }else{
            throw new \common_Exception('invalid qti item');
        }
        return $data;
    }
    
}