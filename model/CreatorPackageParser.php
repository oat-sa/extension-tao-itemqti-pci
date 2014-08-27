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

use oat\taoQtiItem\model\qti\PackageParser;
use oat\taoQtiItem\helpers\QtiPackage;
use common_Exception;
use \ZipArchive;

/**
 * Parser of a QTI PCI Creator package
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
                    
                    throw new common_Exception("A PCI creator package must contains a pciCreator.json file at the root of the archive");
                    
                }else if($zip->locateName("pciCreator.js") === false){
                    
                    throw new common_Exception("A PCI creator package must contains a pciCreator.js file at the root of the archive");
                    
                }else{
                    
                    //check manifest format :
                    $manifest = $this->getManifest();
                    if(!isset($manifest['id'])){
                        throw new common_Exception('missing required attribute in the manifest pciCreator.json : "id"');
                    }
                    $this->valid = true;
                }

                $zip->close();
            }
        }catch(common_Exception $e){
            $this->addError($e);
        }
    }

    public function getManifest(){
        
        $str = '';
        $handle = fopen('zip://'.$this->source.'#pciCreator.json', 'r');
        while(!feof($handle)){
            $str .= fread($handle, 8192);
        }
        fclose($handle);
        
        $returnValue = json_decode($str, true);
        
        return $returnValue;
    }

}