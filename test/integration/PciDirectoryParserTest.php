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

use oat\qtiItemPci\model\IMSPciModel;
use oat\qtiItemPci\model\PciModel;
use oat\qtiItemPci\model\portableElement\parser\PciDirectoryParser;
use oat\tao\test\TaoPhpUnitTestRunner;

class PciDirectoryParserTest extends TaoPhpUnitTestRunner
{
    /**
     * tests initialization
     * load registry service
     */
    public function setUp(){
        TaoPhpUnitTestRunner::initTest();
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');
    }

    public function testParsePciDirectory(){

        $oatPciDir = dirname(__FILE__).'/samples/directoryParser/oat';
        $imsPciDir = dirname(__FILE__).'/samples/directoryParser/ims';

        $oatPciDirectoryParser = new PciDirectoryParser();
        $oatPciDirectoryParser->setModel(new PciModel());

        $imsPciDirectoryParser = new PciDirectoryParser();
        $imsPciDirectoryParser->setModel(new IMSPciModel());

        $this->assertTrue($oatPciDirectoryParser->hasValidPortableElement($oatPciDir));
        $this->assertNotTrue($imsPciDirectoryParser->hasValidPortableElement($oatPciDir));

        $this->assertTrue($imsPciDirectoryParser->hasValidPortableElement($imsPciDir));
        $this->assertNotTrue($oatPciDirectoryParser->hasValidPortableElement($imsPciDir));
    }
}