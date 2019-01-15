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

namespace oat\qtiItemPci\test\integration;

use oat\qtiItemPci\model\IMSPciModel;
use oat\qtiItemPci\model\PciModel;
use oat\qtiItemPci\model\portableElement\parser\PciPackagerParser;
use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\portableElement\exception\PortableElementParserException;

class PciPackageParserTest extends TaoPhpUnitTestRunner
{
    /**
     * tests initialization
     * load qti service
     */
    public function setUp()
    {
        TaoPhpUnitTestRunner::initTest();
    }

    public function testValidatePci()
    {
        $packageValid = dirname(__FILE__).'/samples/package/likertScaleInteraction_v1.0.0.zip';
        $parser = new PciPackagerParser();
        $parser->setModel(new PciModel());
        $this->assertTrue($parser->validate($packageValid));
    }

    public function testExtractFromManifest()
    {
        $packageValid = dirname(__FILE__).'/samples/package/likertScaleInteraction_v1.0.0.zip';

        $parser = new PciPackagerParser();
        $parser->setModel(new PciModel());
        $parser->validate($packageValid);
        $manifest = $parser->getManifestContent($packageValid);

        $this->assertTrue(is_array($manifest));
        $this->assertEquals(11, count($manifest));
        $this->assertEquals('likertScaleInteraction', $manifest['typeIdentifier']);
    }

    public function testValidateWrongModel()
    {
        $this->setExpectedException(PortableElementParserException::class);
        $packageValid = dirname(__FILE__).'/samples/package/likertScaleInteraction_v1.0.0.zip';
        $parser = new PciPackagerParser();
        $parser->setModel(new IMSPciModel());
        $this->assertFalse($parser->validate($packageValid));
    }

    public function testValidateIms()
    {
        $packageValid = dirname(__FILE__).'/samples/package/imsLikert_v0.1.0.zip';
        $parser = new PciPackagerParser();
        $parser->setModel(new IMSPciModel());
        $this->assertTrue($parser->validate($packageValid));
    }

    public function testExtractFromManifestIms()
    {
        $packageValid = dirname(__FILE__).'/samples/package/imsLikert_v0.1.0.zip';

        $parser = new PciPackagerParser();
        $parser->setModel(new IMSPciModel());
        $parser->validate($packageValid);
        $manifest = $parser->getManifestContent($packageValid);

        $this->assertTrue(is_array($manifest));
        $this->assertEquals(12, count($manifest));
        $this->assertEquals('likertInteraction', $manifest['typeIdentifier']);
    }

    public function testValidateWrongModelIms()
    {
        $this->setExpectedException(PortableElementParserException::class);
        $packageValid = dirname(__FILE__).'/samples/package/imsLikert_v0.1.0.zip';
        $parser = new PciPackagerParser();
        $parser->setModel(new PciModel());
        $this->assertFalse($parser->validate($packageValid));
    }
}