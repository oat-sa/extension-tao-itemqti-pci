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
        
        $pciTmpDir = '/tmp/pci12345679/';
        
        $this->registry->register('superPciX', '0.1.0', [
            'likertScaleInteraction/runtime/likertScaleInteraction.amd.js' =>  $pciTmpDir.'runtime/likertScaleInteraction.amd.js'
        ], [
            'likertScaleInteraction/runtime/js/renderer.js' => $pciTmpDir.'runtime/js/renderer.js'
        ], [
            'likertScaleInteraction/runtime/css/likertScaleInteraction.css' => $pciTmpDir.'runtime/css/likertScaleInteraction.css'
        ], [
            'likertScaleInteraction/runtime/assets/ThumbUp.png' => $pciTmpDir.'runtime/css/likertScaleInteraction.css',
            'likertScaleInteraction/runtime/assets/ThumbDown.png' => $pciTmpDir.'runtime/css/likertScaleInteraction.css'
        ]);
        
        var_dump($this->registry->getRuntimeLocation('superPciX', '0.1.0'));
        var_dump($this->registry->getRuntimeLocation('superPciX', '0.1.1'));
        return;
        $this->registry->register('superPciX', '0.1.1', [
            'likertScaleInteraction/runtime/likertScaleInteraction.amd.js' =>  $pciTmpDir.'runtime/likertScaleInteraction.amd.js'
        ]);
        
    }
    
}