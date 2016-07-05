<?php

namespace oat\qtiItemPci\test\model\common;

use oat\qtiItemPci\model\common\model\PortableElementModel;
use oat\qtiItemPci\model\common\PortableElementModelTrait;
use oat\tao\test\TaoPhpUnitTestRunner;

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