<?php
/**
 * Created by PhpStorm.
 * User: siwane
 * Date: 28/06/2016
 * Time: 09:38
 */

namespace oat\qtiItemPci\test;


use oat\oatbox\Configurable;
use oat\oatbox\service\ServiceManager;
use oat\qtiItemPci\model\common\model\PortableElementModel;
use oat\qtiItemPci\model\common\registry\PortableElementRegistryFactory;
use oat\qtiItemPci\model\pci\model\PciModel;
use oat\qtiItemPci\model\pci\registry\PciRegistry;
use oat\qtiItemPci\model\pic\model\PicModel;
use oat\qtiItemPci\model\PortableElementRegistry;
use oat\qtiItemPci\model\PortableElementService;
use oat\tao\test\TaoPhpUnitTestRunner;

class PortableElementServiceTest extends TaoPhpUnitTestRunner
{
    /**
     * @var PortableElementService
     */
    protected $instance;

    public function setUp()
    {
        $this->instance = new PortableElementService();
        $this->instance->setServiceLocator(ServiceManager::getServiceManager());
    }

    public function tearDown()
    {
        $this->instance = null;
    }

    protected function getPortableElement(PortableElementModel $model)
    {
        $reflectionClass = new \ReflectionClass(Configurable::class);
        $reflectionMethod = $reflectionClass->getMethod('getOption');
        $reflectionMethod->setAccessible(true);
        $map = $reflectionMethod->invoke($this->getRegistry($model), PortableElementRegistry::OPTION_REGISTRY);

        return \common_ext_ExtensionsManager::singleton()->getExtensionById('qtiItemPci')->getConfig($map);
    }

    protected function getRegistry(PortableElementModel $model)
    {
        return ServiceManager::getServiceManager()
            ->get(PortableElementRegistryFactory::SERVICE_ID)
            ->getRegistry($model);
    }

    /**
     * @dataProvider validImportProvider
     */
    public function testValidImport($model, $name, $version, $package)
    {
        $result = $this->instance->import($package);
        $portableElement = $this->getPortableElement($model);
        $this->assertEquals(ksort($result->toArray()), ksort($portableElement[$name][$version]));
        $pciRegistry = $this->getRegistry($model);
//        $this->assertTrue($pciRegistry->unregister($result));
    }

    public function validImportProvider()
    {
        return  [
            [new PciModel(), 'likertScaleInteraction', '1.0.0', dirname(__FILE__) . '/samples/package/likertScaleInteraction_v1.0.0.zip'],
            [new PicModel(), 'parccCmRuler', '0.1', dirname(__FILE__) . '/samples/picPackage/parccCmRuler.zip'],
        ];
    }
}