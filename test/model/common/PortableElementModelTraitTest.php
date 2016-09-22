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

namespace oat\qtiItemPci\test\model\common;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\portableElement\common\model\PortableElementModel;
use oat\taoQtiItem\model\portableElement\common\PortableElementModelTrait;

class PortableElementModelTraitTest extends TaoPhpUnitTestRunner
{
    /**
     * @var PortableElementModelTrait
     */
    protected $instance;

    public function setUp()
    {
        $this->instance = $this->getMockForTrait(PortableElementModelTrait::class);
    }

    public function tearDown()
    {
        $this->instance = null;
    }

    public function getPortableElementModelMock()
    {
        return $this->getMock(PortableElementModel::class);
    }

    public function testSetGet()
    {
        $mock = $this->getPortableElementModelMock();
        $this->instance->setModel($mock);

        $this->assertEquals($mock, $this->instance->getModel());
        $this->assertTrue($this->instance->hasModel());
    }

    public function testGetNoModel()
    {
        $this->assertFalse($this->instance->hasModel());
        $this->setExpectedException(\common_Exception::class);
        $this->instance->getModel();
    }
}