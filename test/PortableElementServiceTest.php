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

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\portableElement\common\model\PortableElementModel;
use oat\taoQtiItem\model\portableElement\pci\model\PciModel;
use oat\taoQtiItem\model\portableElement\pic\model\PicModel;
use oat\taoQtiItem\model\portableElement\PortableElementRegistry;
use oat\taoQtiItem\model\portableElement\PortableElementService;

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

    protected function getPortableElements(PortableElementModel $model)
    {
        $reflectionClass = new \ReflectionClass(Configurable::class);
        $reflectionMethod = $reflectionClass->getMethod('getOption');
        $reflectionMethod->setAccessible(true);
        $map = $reflectionMethod->invoke($this->getRegistry($model), PortableElementRegistry::OPTION_REGISTRY);

        return \common_ext_ExtensionsManager::singleton()->getExtensionById('qtiItemPci')->getConfig($map);
    }

    protected function getRegistry(PortableElementModel $model)
    {
        return new PortableElementRegistry($model);
    }

    /**
     * @dataProvider validImportProvider
     */
    public function testValidImport($model, $name, $version, $package)
    {
        $result = $this->instance->import($package);
        $portableElements = $this->getPortableElements($model);
        $this->assertEquals(ksort($result->toArray()), ksort($portableElements[$name][$version]));
        $pciRegistry = $this->getRegistry($model);
//        $this->assertTrue($pciRegistry->unregister($result));
    }

    public function validImportProvider()
    {
        return  [
            [new PciModel(), 'likertScaleInteraction', '1.0.0', dirname(__FILE__) . '/samples/package/likertScaleInteraction_v1.0.0.zip'],
            [new PicModel(), 'sampleToolCmRuler', '0.1', dirname(__FILE__) . '/samples/picPackage/sampleToolCmRuler.zip'],
        ];
    }
}