<?php

namespace oat\qtiItemPci\test\model\common\model;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\portableElement\common\model\PortableElementModel;

class PortableElementModelTest extends TaoPhpUnitTestRunner
{
    public function testConstruct()
    {
        /** @var PortableElementModel $mock */
        $mock = $this->getMockForAbstractClass(PortableElementModel::class, array());
        $this->assertNull($mock->getTypeIdentifier());
        $this->assertNull($mock->getVersion());

        $mock = $this->getMockForAbstractClass(PortableElementModel::class, array('identifierFixture'));
        $this->assertEquals('identifierFixture', $mock->getTypeIdentifier());
        $this->assertNull($mock->getVersion());

        $mock = $this->getMockForAbstractClass(PortableElementModel::class, array('identifierFixture', 'versionFixture'));
        $this->assertEquals('identifierFixture', $mock->getTypeIdentifier());
        $this->assertEquals('versionFixture', $mock->getVersion());
    }

    public function testSimpleGetSet()
    {
        /** @var PortableElementModel $mock */
        $mock = $this->getMockForAbstractClass(PortableElementModel::class, array());

        $this->assertInstanceOf(PortableElementModel::class, $mock->setTypeIdentifier('identifierFixture'));
        $this->assertEquals('identifierFixture', $mock->getTypeIdentifier());

        $this->assertInstanceOf(PortableElementModel::class, $mock->setVersion('versionFixture'));
        $this->assertEquals('versionFixture', $mock->getVersion());

        $this->assertInstanceOf(PortableElementModel::class, $mock->setLabel('labelFixture'));
        $this->assertEquals('labelFixture', $mock->getLabel());

        $this->assertInstanceOf(PortableElementModel::class, $mock->setShort('shortFixture'));
        $this->assertEquals('shortFixture', $mock->getShort());

        $this->assertInstanceOf(PortableElementModel::class, $mock->setDescription('descriptionFixture'));
        $this->assertEquals('descriptionFixture', $mock->getDescription());

        $this->assertInstanceOf(PortableElementModel::class, $mock->setAuthor('authorFixture'));
        $this->assertEquals('authorFixture', $mock->getAuthor());

        $this->assertInstanceOf(PortableElementModel::class, $mock->setEmail('emailFixture'));
        $this->assertEquals('emailFixture', $mock->getEmail());
    }

    public function testVersion()
    {
        /** @var PortableElementModel $mock */
        $mock = $this->getMockForAbstractClass(PortableElementModel::class);
        $this->assertFalse($mock->hasVersion());
        $this->assertInstanceOf(PortableElementModel::class, $mock->setVersion('versionFixture'));
        $this->assertTrue($mock->hasVersion());
    }
//    public function testStructuredGetSet()
//    {
//        $this->assertInstanceOf(PortableElementModel::class, $mock->setTypeIdentifier('tagsFixture'));
//        $this->assertEquals('identifierFixture', $mock->getTypeIdentifier());
//
//        $this->assertInstanceOf(PortableElementModel::class, $mock->setTypeIdentifier('runtimeFixture'));
//        $this->assertEquals('identifierFixture', $mock->getTypeIdentifier());
//    }

//    public function testExchangeArray() {
//
//    }
}