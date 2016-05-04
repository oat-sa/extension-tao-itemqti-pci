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
        
        $this->registry->register('likertScaleInteraction', '0.1.0', [
            'hook' => ['runtime/likertScaleInteraction.amd.js' =>  $pciTmpDir.'runtime/likertScaleInteraction.amd.js'],
            'libraries' => [
                'runtime/js/renderer.js' => $pciTmpDir.'runtime/js/renderer.js'
            ],
            'stylesheets' => [
                'runtime/css/likertScaleInteraction.css' => $pciTmpDir.'runtime/css/likertScaleInteraction.css',
                'runtime/css/base.css' => $pciTmpDir.'runtime/css/base.css'
            ],
            'mediaFiles' => [
                'runtime/assets/ThumbDown.png' => $pciTmpDir.'runtime/assets/ThumbDown.png',
                'runtime/assets/ThumbUp.png' => $pciTmpDir.'runtime/assets/ThumbUp.png',
                'runtime/css/img/bg.png' => $pciTmpDir.'runtime/css/img/bg.png'
            ]
        ],[
            "icon" => ['creator/img/icon.svg' => $pciTmpDir.'creator/img/icon.svg'],
            "hook"=> ['pciCreator.js' => $pciTmpDir.'pciCreator.js'],
            "manifest"=> ['pciCreator.json' => $pciTmpDir.'pciCreator.json'],
            "libraries"=> [
                'creator/tpl/markup.tpl' => $pciTmpDir.'creator/tpl/markup.tpl',
                'creator/tpl/propertiesForm.tpl' => $pciTmpDir.'creator/tpl/propertiesForm.tpl',
                'creator/widget/Widget.js' => $pciTmpDir.'creator/widget/Widget.js',
                'creator/widget/states/Question.js' => $pciTmpDir.'creator/widget/states/Question.js',
                'creator/widget/states/states.js' => $pciTmpDir.'creator/widget/states/states.js'
            ],
            'stylesheets' => [],
            'mediaFiles' => []
        ]);
        
        $this->assertTrue(strlen($this->registry->getBaseUrl('likertScaleInteraction', '0.1.0')) > 0);
        $this->assertFalse($this->registry->getBaseUrl('likertScaleInteraction', '0.1.1'));
        
        $pci = $this->registry->getRuntime('likertScaleInteraction', '0.1.0');
        $pcis = $this->registry->getLatestRuntime();
        var_dump($pcis);
    }
    
}