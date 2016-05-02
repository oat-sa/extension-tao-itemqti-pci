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
 * Copyright (c) 2013-2015 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

namespace oat\qtiItemPci\test;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\qtiItemPci\model\PciRegistry;


class PciRegistryTest extends TaoPhpUnitTestRunner
{

    protected $registry;

    /**
     * tests initialization
     * load registry service
     */
    public function setUp(){
        TaoPhpUnitTestRunner::initTest();
//        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');
        $this->registry = \oat\oatbox\service\ServiceManager::getServiceManager()->get(PciRegistry::SERVICE_ID);
    }
    
    /**
     * remove all created instances
     */
    public function tearDown(){
        if($this->registry != null){
//            $this->registry->unregisterAll();
        }
        else {
            $this->fail('registry should not be null' );
        }
    }
    
    public function testRegister(){
        
        $pciTmpDir = dirname(__FILE__).'/../views/js/pciCreator/dev/likertScaleInteraction/';
        
        $this->registry->register('superPciX', '0.1.0', [
            'runtime/likertScaleInteraction.amd.js' =>  $pciTmpDir.'runtime/likertScaleInteraction.amd.js'
        ], [
            'runtime/js/renderer.js' => $pciTmpDir.'runtime/js/renderer.js'
        ], [
            'runtime/css/likertScaleInteraction.css' => $pciTmpDir.'runtime/css/likertScaleInteraction.css'
        ], [
            'runtime/assets/ThumbDown.png' => $pciTmpDir.'runtime/assets/ThumbDown.png',
            'runtime/assets/ThumbUp.png' => $pciTmpDir.'runtime/assets/ThumbUp.png'
        ]);
        
        $this->assertTrue(strlen($this->registry->getRuntimeLocation('superPciX', '0.1.0')) > 0);
        $this->assertFalse($this->registry->getRuntimeLocation('superPciX', '0.1.1'));
        
        $pci = $this->registry->get('superPciX', '0.1.0');
    }
    
}