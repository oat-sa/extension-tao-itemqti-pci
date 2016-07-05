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

use oat\qtiItemPci\model\common\model\PortableElementModel;
use oat\qtiItemPci\model\common\parser\PortableElementPackageParser;
use oat\qtiItemPci\model\common\PortableElementFactory;
use oat\qtiItemPci\model\common\validator\PortableElementModelValidator;
use oat\qtiItemPci\model\pci\model\PciModel;
use oat\qtiItemPci\model\pci\validator\PciValidator;
use oat\qtiItemPci\model\pic\model\PicModel;
use oat\qtiItemPci\model\pic\validator\PicValidator;
use oat\tao\test\TaoPhpUnitTestRunner;

class PortableElementFactoryTest extends TaoPhpUnitTestRunner
{
    public function testGetAvailableModels()
    {
        $reflectionMethod = new \ReflectionMethod(PortableElementFactory::class, 'getAvailableModels');
        $reflectionMethod->setAccessible(true);
        $models = $reflectionMethod->invoke(null);
        $this->assertEquals([new PciModel(), new PicModel()], $models);
    }

    /**
     * @dataProvider getValidatorProvider
     */
    public function testGetValidator($model, $expectedClass)
    {
        $validator = PortableElementFactory::getValidator($model);
        $this->assertInstanceOf($expectedClass, $validator);
        $this->assertEquals($model, $validator->getModel());
    }

    public function getValidatorProvider()
    {
        return [
            [new PciModel(), PciValidator::class],
            [new PicModel(), PicValidator::class],
            [$this->getMock(PortableElementModel::class), PortableElementModelValidator::class]
        ];
    }

    public function getFactoryMock($model, $exception=null)
    {
        $pciRegistry = $this->getMockBuilder('registryFixture')
            ->setMockClassName($this->getRegistryFixtureName($model))
            ->setMethods(array('setServiceLocator'))
            ->getMock();

        $picRegistry = $this->getMockBuilder('registryFixture')
            ->setMockClassName($this->getRegistryFixtureName($model))
            ->setMethods(array('setServiceLocator'))
            ->getMock();

        if (!$exception) {
            if ($model instanceof PciModel) {
                $pciRegistry->expects($this->once())
                    ->method('setServiceLocator');
            }

            if ($model instanceof PicModel) {
                $picRegistry->expects($this->once())
                    ->method('setServiceLocator');
            }
        }

        return new PortableElementFactory(array(
            'pciRegistry' => $pciRegistry,
            'picRegistry' => $picRegistry,
        ));
    }

    public function getRegistryFixtureName($model)
    {
        return end(explode('\\' , get_class($model))) . 'FixtureRegistry';
    }

    /**
     * @dataProvider getRegistryProvider
     */
    public function testGetRegistry($model, $exception)
    {
        $factory = $this->getFactoryMock($model, $exception);

        if ($exception) {
            $this->setExpectedException($exception);
        }
        $registry = $factory->getRegistry($model);
        $this->assertInstanceOf($this->getRegistryFixtureName($model), $registry);
    }

    public function getRegistryProvider()
    {
        return [
            [new PciModel(), null],
            [new PicModel(), null],
            [$this->getMock(PortableElementModel::class), \common_Exception::class],
        ];
    }
}