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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

namespace oat\qtiItemPci\test\integration;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\qti\Parser;

class PciItemParserTest extends TaoPhpUnitTestRunner
{
    /**
     * tests initialization
     * load registry service
     */
    public function setUp(){
        TaoPhpUnitTestRunner::initTest();
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');
    }


    public function testParseOatPci(){
        $qtiParser = new Parser(dirname(__FILE__).'/samples/xml/oat/version_and_assets.xml');

        $qtiParser->validate();
        if(!$qtiParser->isValid()){
            echo $qtiParser->displayErrors();
        }

        $item = $qtiParser->load();
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\Item',$item);

        $pcis = $item->getComposingElements('\\oat\\taoQtiItem\\model\\qti\\interaction\\PortableCustomInteraction');
        $this->assertEquals(1, count($pcis));

        /**
         * @var $pci \oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction
         */
        $pci = array_pop($pcis);

        $this->assertEquals('likertScaleInteraction', $pci->getTypeIdentifier());
        $this->assertEquals('1.0.0', $pci->getVersion());
        $this->assertEquals(['IMSGlobal/jquery_2_1_1', 'likertScaleInteraction/runtime/renderer'], $pci->getLibraries());
        $this->assertEquals(['level' => '5', 'label-min' => 'min', 'label-max' => 'max'], $pci->getProperties());
        $this->assertEquals(['likertScaleInteraction/style/base.css', 'likertScaleInteraction/style/renderer.css'], $pci->getStylesheets());
    }

    /**
     * @return array
     */
    public function imsPciPovider()
    {
        return [
            [dirname(__FILE__).'/samples/xml/ims/likert-global-ns.xml'],
            [dirname(__FILE__).'/samples/xml/ims/likert-inline-ns.xml']
        ];
    }

    /**
     * @dataProvider imsPciPovider
     */
    public function testParseImsPci($file){

        $qtiParser = new Parser($file);
        $qtiParser->validate();
        if(!$qtiParser->isValid()){
            echo $qtiParser->displayErrors();
        }

        $item = $qtiParser->load();
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\Item',$item);

        $pcis = $item->getComposingElements('\\oat\\taoQtiItem\\model\\qti\\interaction\\ImsPortableCustomInteraction');
        $this->assertEquals(1, count($pcis));

        /**
         * @var $pci \oat\taoQtiItem\model\qti\interaction\ImsPortableCustomInteraction
         */
        $pci = array_pop($pcis);

        $this->assertEquals('likertScaleInteraction', $pci->getTypeIdentifier());

        $modules = $pci->getModules();
        $this->assertEquals(['likertScaleInteraction/runtime/js/likertScaleInteraction.js'], $modules['likertScaleInteraction/runtime/js/likertScaleInteraction']);
        $this->assertEquals([
            'likertScaleInteraction/runtime/js/renderer-unexisting.js',
            'likertScaleInteraction/runtime/js/renderer.js'
        ], $modules['likertScaleInteraction/runtime/js/renderer']);
        $this->assertEquals([], $modules['jquery_2_1_1']);

        $this->assertEquals(['oat-pci-unexisting.json', 'oat-pci.json'], $pci->getConfig());
        $this->assertEquals(['level' => '5', 'label-min' => 'min', 'label-max' => 'max'], $pci->getProperties());
    }

    public function testParseImsPciWithConfig(){
        $qtiParser = new Parser(dirname(__FILE__).'/samples/xml/ims/likert-v1.xml');

        $qtiParser->validate();
        if(!$qtiParser->isValid()){
            echo $qtiParser->displayErrors();
        }

        $item = $qtiParser->load();
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\Item',$item);

        $pcis = $item->getComposingElements('\\oat\\taoQtiItem\\model\\qti\\interaction\\ImsPortableCustomInteraction');
        $this->assertEquals(1, count($pcis));

        /**
         * @var $pci \oat\taoQtiItem\model\qti\interaction\ImsPortableCustomInteraction
         */
        $pci = array_pop($pcis);

        $this->assertEquals('likertInteraction', $pci->getTypeIdentifier());

        $modules = $pci->getModules();

        $this->assertEquals(['likertInteraction/runtime/js/likertInteraction.js'], $modules['likertInteraction/runtime/js/likertInteraction']);
        $this->assertEquals([], $modules['likertInteraction/runtime/js/renderer']);

        $this->assertEquals(['likertInteraction/runtime/likertConfig.json'], $pci->getConfig());
        $this->assertEquals(['level' => '5', 'label-min' => 'min', 'label-max' => 'max'], $pci->getProperties());
    }

    /**
     * @return array
     */
    public function compositeOatImsPciPovider()
    {
        return [
            [dirname(__FILE__).'/samples/xml/multi/likert-oat-ims.xml'],
            [dirname(__FILE__).'/samples/xml/multi/likert-oat-ims-ns.xml']
        ];
    }

    /**
     * @dataProvider compositeOatImsPciPovider
     */
    public function testParseOatAndImsPciWithConfig($file){

        $qtiParser = new Parser($file);

        $qtiParser->validate();
        if(!$qtiParser->isValid()){
            echo $qtiParser->displayErrors();
        }

        $item = $qtiParser->load();
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\Item',$item);

        $this->assertEquals(2, count($item->getInteractions()));

        $pcis = $item->getComposingElements('\\oat\\taoQtiItem\\model\\qti\\interaction\\ImsPortableCustomInteraction');
        $this->assertEquals(1, count($pcis));
        $imsPci = reset($pcis);

        $pcis = $item->getComposingElements('\\oat\\taoQtiItem\\model\\qti\\interaction\\PortableCustomInteraction');
        $this->assertEquals(1, count($pcis));
        $oatPci = reset($pcis);

        $this->assertEquals('http://www.imsglobal.org/xsd/portableCustomInteraction', $oatPci->getNamespace()->getUri());
        $this->assertEquals('http://www.imsglobal.org/xsd/portableCustomInteraction_v1', $imsPci->getNamespace()->getUri());
    }

    public function testParseOatMulti(){

        $qtiParser = new Parser(dirname(__FILE__).'/samples/xml/oat/likert_audio.xml');

        $qtiParser->validate();
        if(!$qtiParser->isValid()){
            echo $qtiParser->displayErrors();
        }

        $item = $qtiParser->load();
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\Item',$item);

        $this->assertEquals(2, count($item->getInteractions()));

        $pcis = $item->getComposingElements('\\oat\\taoQtiItem\\model\\qti\\interaction\\PortableCustomInteraction');
        $this->assertEquals(2, count($pcis));
        $oatPci = array_pop($pcis);

        $this->assertEquals('http://www.imsglobal.org/xsd/portableCustomInteraction', $oatPci->getNamespace()->getUri());
    }
}