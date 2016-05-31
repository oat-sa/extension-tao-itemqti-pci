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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */
namespace oat\qtiItemPci\test;

use oat\oatbox\service\ServiceManager;
use oat\qtiItemPci\model\PciModel;
use oat\qtiItemPci\model\PciRegistry;
use oat\qtiItemPci\model\PciService;
use oat\tao\test\TaoPhpUnitTestRunner;
use oat\qtiItemPci\model\PciPackageParser;

class PciPackageParserTest extends TaoPhpUnitTestRunner
{

    protected $qtiService;

    /**
     * tests initialization
     * load qti service
     */
    public function setUp(){
        TaoPhpUnitTestRunner::initTest();
    }


    public function testValidate(){

        $packageValid = dirname(__FILE__).'/samples/package/likertScaleInteraction_v1.0.0.zip';
        $parser = new PciPackageParser($packageValid);
        $this->assertTrue($parser->validate());
        
    }

    public function testGetPciModelFromManifest(){

        $packageValid = dirname(__FILE__).'/samples/package/likertScaleInteraction_v1.0.0.zip';

        $parser = new PciPackageParser($packageValid);
        $pciModel = $parser->getPciModel();
        $this->assertInstanceOf(PciModel::class, $pciModel);
        $this->assertEquals('likertScaleInteraction', $pciModel->getTypeIdentifier());
    }

    public function testValidImport()
    {
        $packageValid = dirname(__FILE__) . '/samples/package/likertScaleInteraction_v1.0.0.zip';
        $pciName = 'likertScaleInteraction';
        $pciVersion = '1.0.0';

        $service = new PciService();
        $service->setServiceLocator(ServiceManager::getServiceManager());

        $result = $service->import($packageValid);
        $pcis = \common_ext_ExtensionsManager::singleton()->getExtensionById('qtiItemPci')->getConfig(PciRegistry::CONFIG_ID);
        $this->assertEquals(ksort($result->toArray()), ksort($pcis[$pciName][$pciVersion]));
        $pciRegistry = new PciRegistry();
        $this->assertTrue($pciRegistry->unregister($result));
    }
}