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

namespace oat\qtiItemPci\test;

use oat\oatbox\service\ServiceManager;
use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\portableElement\common\parser\PortableElementPackageParser;
use oat\taoQtiItem\model\portableElement\pci\model\PciModel;
use oat\taoQtiItem\model\portableElement\PortableElementService;
use oat\qtiItemPci\model\portableElement\storage\PciRegistry;


class PciRegistryTest extends TaoPhpUnitTestRunner
{

    /**
     * @var PciRegistry
     */
    protected $registry;

    /**
     * tests initialization
     * load registry service
     */
    public function setUp(){
        TaoPhpUnitTestRunner::initTest();
        $this->registry = PciRegistry::getRegistry();
    }
    
    /**
     * remove all created instances
     */
    public function tearDown(){
        if($this->registry != null){
//            $this->registry->unregisterAll();
        }
        else {
            $this->fail('registry should not be null' );
        }
    }
    
    public function notestRegister(){
        
        $pciTmpDir = dirname(__FILE__).'/../views/js/pciCreator/dev/likertScaleInteraction/';
        
        $this->registry->register('likertScaleInteraction', '0.1.0', [
            'hook' => ['runtime/likertScaleInteraction.amd.js' =>  $pciTmpDir.'runtime/likertScaleInteraction.amd.js'],
            'libraries' => [
                'runtime/js/renderer.js' => $pciTmpDir.'runtime/js/renderer.js'
            ],
            'stylesheets' => [
                'runtime/css/likertScaleInteraction.css' => $pciTmpDir.'runtime/css/likertScaleInteraction.css',
                'runtime/css/base.css' => $pciTmpDir.'runtime/css/base.css'
            ],
            'mediaFiles' => [
                'runtime/assets/ThumbDown.png' => $pciTmpDir.'runtime/assets/ThumbDown.png',
                'runtime/assets/ThumbUp.png' => $pciTmpDir.'runtime/assets/ThumbUp.png',
                'runtime/css/img/bg.png' => $pciTmpDir.'runtime/css/img/bg.png'
            ]
        ],[
            "icon" => ['creator/img/icon.svg' => $pciTmpDir.'creator/img/icon.svg'],
            "hook"=> ['pciCreator.js' => $pciTmpDir.'pciCreator.js'],
            "manifest"=> ['pciCreator.json' => $pciTmpDir.'pciCreator.json'],
            "libraries"=> [
                'creator/tpl/markup.tpl' => $pciTmpDir.'creator/tpl/markup.tpl',
                'creator/tpl/propertiesForm.tpl' => $pciTmpDir.'creator/tpl/propertiesForm.tpl',
                'creator/widget/Widget.js' => $pciTmpDir.'creator/widget/Widget.js',
                'creator/widget/states/Question.js' => $pciTmpDir.'creator/widget/states/Question.js',
                'creator/widget/states/states.js' => $pciTmpDir.'creator/widget/states/states.js'
            ],
            'stylesheets' => [],
            'mediaFiles' => []
        ]);
        
        $this->assertTrue(strlen($this->registry->getBaseUrl('likertScaleInteraction', '0.1.0')) > 0);
        $this->assertFalse($this->registry->getBaseUrl('likertScaleInteraction', '0.1.1'));
        
        $pci = $this->registry->getRuntime('likertScaleInteraction', '0.1.0');
        $pcis = $this->registry->getLatestRuntimes();

        $isOnRuntime = false;
        foreach ($pcis as $name => $runtime) {
            foreach ($runtime as $key => $runtime_pci) {
                if ($pci==$runtime_pci) {
                    $isOnRuntime = true;
                    break;
                }
            }
        }
        $this->assertTrue($isOnRuntime);
    }

    public function testExport()
    {
        $packageValid = dirname(__FILE__) . '/samples/package/likertScaleInteraction_v1.0.0';

        $pciModel = new PciModel('likertScaleInteraction', '1.0.0');
        $pciModel->exchangeArray(json_decode(file_get_contents($packageValid . DIRECTORY_SEPARATOR . PciModel::PCI_MANIFEST), true));

        $service = new PortableElementService();
        $service->setServiceLocator(ServiceManager::getServiceManager());

        $reflectionClass = new \ReflectionClass(PortableElementService::class);
        $reflectionMethod = $reflectionClass->getMethod('getRegistry');
        $reflectionMethod->setAccessible(true);
        $registry = $reflectionMethod->invoke($service, new PciModel());

        $registry->setSource($packageValid);
        $registry->register($pciModel);

        $exportDirectory = $registry->export($pciModel);

        $parser = new PortableElementPackageParser($exportDirectory);
        $parser->setModel(new PciModel());
        $source = $parser->extract();

        $original = $this->fillArrayWithFileNodes(new \DirectoryIterator($packageValid));
        $exported = $this->fillArrayWithFileNodes(new \DirectoryIterator($source));

        $this->assertEquals(
            preg_replace('/\s+/', '', file_get_contents($packageValid . DIRECTORY_SEPARATOR . PciModel::PCI_MANIFEST)),
            preg_replace('/\s+/', '', file_get_contents($source . DIRECTORY_SEPARATOR . PciModel::PCI_MANIFEST))
        );
        $this->assertTrue(empty($this->array_diff_assoc_recursive($original, $exported)));
        $registry->unregister($pciModel);
        \tao_helpers_File::delTree($source);
    }

    function fillArrayWithFileNodes(\DirectoryIterator $dir)
    {
        $data = array();
        foreach ($dir as $node) {
            if ($node->isDir() && !$node->isDot()) {
                $data[$node->getFilename()] = $this->fillArrayWithFileNodes( new \DirectoryIterator( $node->getPathname() ) );
            } elseif ($node->isFile()) {
                $data[] = $node->getFilename();
            }
        }
        return $data;
    }

    protected function array_diff_assoc_recursive($array1, $array2)
    {
        $difference=array();
        foreach ($array1 as $key => $value) {
            if (is_array($value)) {
                if (!isset($array2[$key]) || !is_array($array2[$key])) {
                    $difference[$key] = $value;
                } else {
                    $new_diff = $this->array_diff_assoc_recursive($value, $array2[$key]);
                    if (!empty($new_diff)) {
                        $difference[$key] = $new_diff;
                    }
                }
            } elseif (!array_key_exists($key,$array2) || !in_array($value, $array2)) {
                $difference[$key] = $value;
            }
        }
        return $difference;
    }
}
