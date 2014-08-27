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

namespace oat\taoQtiItem\model\qti;

use oat\taoQtiItem\model\qti\PackageParser;
use oat\taoQtiItem\helpers\QtiPackage;
use \ZipArchive;

/**
 * The hook used in the item creator
 *
 * @package qtiItemPci
 */
class CreatorPackageParser extends PackageParser
{

    /**
     * Validate the sample package
     *
     * @access public
     * @param  string schema
     * @return boolean
     */
    public function validate($schema = ''){

        $this->valid = false;
        
        try{
            
            if(QtiPackage::isValidZip($this->source)){

                $zip = new ZipArchive();
                $zip->open($this->source, ZIPARCHIVE::CHECKCONS);
                if($zip->locateName("pciCreator.json") === false){
                    throw new Exception("A PCI creator package must contains a pciCreator.json file at the root of the archive");
                }else if($zip->locateName("pciCreator.js") === false){
                    throw new Exception("A PCI creator package must contains a pciCreator.js file at the root of the archive");
                }else{
                    //check manifest format :
                    
                    $this->valid = true;
                }

                $zip->close();
            }
            
        }catch(Exception $e){
            $this->addError($e);
        }
    }

}