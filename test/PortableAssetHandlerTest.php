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
 *
 */

namespace oat\qtiItemPci\test;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\portableElement\exception\PortableElementNotFoundException;
use oat\taoQtiItem\model\portableElement\PortableElementService;
use oat\taoQtiItem\model\qti\asset\handler\PortableAssetHandler;
use oat\taoQtiItem\model\qti\Parser;
use oat\taoQtiItem\model\portableElement\parser\itemParser\PortableElementItemParser;

class PortableAssetHandlerTest extends TaoPhpUnitTestRunner
{
    public function testLikertV0()
    {
        $packageDir = dirname(__FILE__).'/samples/pci_likert_0/';
        $qtiParser = new Parser($packageDir.'/i150107567172373/qti.xml');
        $portableAssetHandler = new PortableAssetHandler($qtiParser->load(), $packageDir);

        $portableElementService = new PortableElementService();

        $reflectionClass = new \ReflectionClass(PortableAssetHandler::class);
        $reflectionProperty = $reflectionClass->getProperty('portableItemParser');
        $reflectionProperty->setAccessible(true);
        $this->assertInstanceOf(PortableElementItemParser::class, $reflectionProperty->getValue($portableAssetHandler));

        $portableItemParser = $reflectionProperty->getValue($portableAssetHandler);

        $reqs = [
            'likertScaleInteractionSample/runtime/js/likertScaleInteractionSample.js',
            'likertScaleInteractionSample/runtime/js/renderer.js',
            'portableLib/jquery_2_1_1.js',
            'oat-pci.json'
        ];

        //check that required files are
        foreach($reqs as $req){
            $this->assertEquals(true, $portableAssetHandler->isApplicable($req));
            $absPath = $packageDir. '/' . $req;
            $this->assertEquals(false, empty($portableAssetHandler->handle($absPath, $req)));
        }

        //check that not required files are not
        $this->assertEquals(false, $portableAssetHandler->isApplicable('likertScaleInteractionSample/runtime/js/renderer-unexisting.js'));
        $this->assertEquals(false, $portableAssetHandler->isApplicable('oat-pci-unexisting.json'));

        $portableObjects = $portableItemParser->getPortableObjects();

        foreach($portableObjects as $portableObject) {
            try{
                $portableElementService->unregisterModel($portableObject);
            }catch(PortableElementNotFoundException $e){

            }

        }

        $portableAssetHandler->finalize();

        foreach($portableObjects as $portableObject){
            $retrivedElement = $portableElementService->getPortableElementByIdentifier($portableObject->getModel()->getId(), $portableObject->getTypeIdentifier());
            $this->assertEquals($portableObject->getTypeIdentifier(), $retrivedElement->getTypeIdentifier());

            $portableElementService->unregisterModel($retrivedElement);
        }
    }

    public function testLikertV1()
    {
        $packageDir = dirname(__FILE__).'/samples/pci_likert_1/';
        $qtiParser = new Parser($packageDir.'/i150107567172373/qti.xml');
        $portableAssetHandler = new PortableAssetHandler($qtiParser->load(), $packageDir);

        $portableElementService = new PortableElementService();

        $reflectionClass = new \ReflectionClass(PortableAssetHandler::class);
        $reflectionProperty = $reflectionClass->getProperty('portableItemParser');
        $reflectionProperty->setAccessible(true);
        $this->assertInstanceOf(PortableElementItemParser::class, $reflectionProperty->getValue($portableAssetHandler));

        $portableItemParser = $reflectionProperty->getValue($portableAssetHandler);

        $reqs = [
            'likertInteraction/runtime/js/likertInteraction.js',
            'likertInteraction/runtime/js/renderer.js',
            'likertInteraction/runtime/likertConfig.json'
        ];

        //check that required files are
        foreach($reqs as $req){
            $this->assertEquals(true, $portableAssetHandler->isApplicable($req));
            $absPath = $packageDir. '/' . $req;
            $this->assertEquals(false, empty($portableAssetHandler->handle($absPath, $req)));
        }

        //check that not required files are not
        $this->assertEquals(false, $portableAssetHandler->isApplicable('likertScaleInteractionSample/runtime/js/renderer-unexisting.js'));
        $this->assertEquals(false, $portableAssetHandler->isApplicable('oat-pci-unexisting.json'));

        $portableObjects = $portableItemParser->getPortableObjects();

        foreach($portableObjects as $portableObject) {
            try{
                $portableElementService->unregisterModel($portableObject);
            }catch(PortableElementNotFoundException $e){}
        }

        $portableAssetHandler->finalize();

        foreach($portableObjects as $portableObject){
            $retrivedElement = $portableElementService->getPortableElementByIdentifier($portableObject->getModel()->getId(), $portableObject->getTypeIdentifier());
            $this->assertEquals($portableObject->getTypeIdentifier(), $retrivedElement->getTypeIdentifier());

            $portableElementService->unregisterModel($retrivedElement);
        }
    }
}