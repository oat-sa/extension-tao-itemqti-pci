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

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\portableElement\common\parser\PortableElementPackageParser;
use oat\taoQtiItem\model\portableElement\pci\model\PciModel;

class PciPackageParserTest extends TaoPhpUnitTestRunner
{

    protected $qtiService;

    /**
     * tests initialization
     * load qti service
     */
    public function setUp()
    {
        TaoPhpUnitTestRunner::initTest();
    }


    public function testValidate()
    {

        $packageValid = dirname(__FILE__).'/samples/package/likertScaleInteraction_v1.0.0.zip';
        $parser = new PortableElementPackageParser($packageValid);
        $parser->setModel(new PciModel());
        $this->assertTrue($parser->validate());
        
    }

    public function testExtractFromManifest()
    {

        $packageValid = dirname(__FILE__).'/samples/package/likertScaleInteraction_v1.0.0.zip';

        $parser = new PortableElementPackageParser($packageValid);
        $parser->setModel(new PciModel());
        $parser->validate();
        $model = $parser->getModel();

        $this->assertInstanceOf(PciModel::class, $model);
        $this->assertEquals('likertScaleInteraction', $model->getTypeIdentifier());
    }


}