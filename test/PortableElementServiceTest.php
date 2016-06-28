<?php
/**
 * Created by PhpStorm.
 * User: siwane
 * Date: 28/06/2016
 * Time: 09:38
 */

namespace oat\qtiItemPci\test;


use oat\oatbox\service\ServiceManager;
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

    protected function getPcis()
    {
        return \common_ext_ExtensionsManager::singleton()->getExtensionById('qtiItemPci')->getConfig(PortableElementRegistry::CONFIG_ID);
    }

    /**
     * @dataProvider validImportProvider
     */
    public function testValidImport($name, $version, $package)
    {
        $result = $this->instance->import($package);
        $pcis = $this->getPcis();
        $this->assertEquals(ksort($result->toArray()), ksort($pcis[$name][$version]));
        $pciRegistry = new PortableElementRegistry();
        $this->assertTrue($pciRegistry->unregister($result));
    }

    public function validImportProvider()
    {
        return  [
            ['likertScaleInteraction', '1.0.0', dirname(__FILE__) . '/samples/package/likertScaleInteraction_v1.0.0.zip'],
            ['Archive', '0.1', dirname(__FILE__) . '/samples/picPackage/parccCmRuler.zip'],
        ];
    }
}