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

namespace oat\qtiItemPci\test\integration;

use oat\oatbox\service\ServiceManager;
use oat\qtiItemPci\model\PciModel;
use oat\qtiItemPci\model\portableElement\dataObject\PciDataObject;
use oat\qtiItemPci\model\portableElement\parser\PciPackagerParser;
use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\portableElement\exception\PortableElementNotFoundException;
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
    public function setUp()
    {
        TaoPhpUnitTestRunner::initTest();
        $this->registry = PciRegistry::getRegistry();
        $this->registry->setServiceLocator(ServiceManager::getServiceManager());
    }

    /**
     * remove all created instances
     */
    public function tearDown()
    {
        if ($this->registry === null) {
            $this->fail('registry should not be null');
        }
    }

    public function testRegister()
    {
        $pciTmpDir = dirname(__FILE__) . '/samples/directoryParser/ims/';

        $pciModel = new PciModel();

        $pciDataObject = new PciDataObject('likertScaleInteraction', '1.0.0');
        $pciDataObject->setModel($pciModel);
        $pciDataObject->setCreator([
            "icon" => ['creator/img/icon.svg' => $pciTmpDir . 'creator/img/icon.svg'],
            "hook" => ['pciCreator.js' => $pciTmpDir . 'pciCreator.js'],
            "manifest" => ['pciCreator.json' => $pciTmpDir . 'pciCreator.json'],
            "libraries" => [
                'creator/tpl/markup.tpl' => $pciTmpDir . 'creator/tpl/markup.tpl',
                'creator/tpl/propertiesForm.tpl' => $pciTmpDir . 'creator/tpl/propertiesForm.tpl',
                'creator/widget/Widget.js' => $pciTmpDir . 'creator/widget/Widget.js',
                'creator/widget/states/Question.js' => $pciTmpDir . 'creator/widget/states/Question.js',
                'creator/widget/states/states.js' => $pciTmpDir . 'creator/widget/states/states.js'
            ],
            'stylesheets' => [],
            'mediaFiles' => []
        ]);
        $pciDataObject->setRuntime([
            'hook' => ['runtime/likertScaleInteraction.amd.js' => $pciTmpDir . 'runtime/likertScaleInteraction.amd.js'],
            'libraries' => [
                'runtime/js/renderer.js' => $pciTmpDir . 'runtime/js/renderer.js'
            ],
            'stylesheets' => [
                'runtime/css/likertScaleInteraction.css' => $pciTmpDir . 'runtime/css/likertScaleInteraction.css',
                'runtime/css/base.css' => $pciTmpDir . 'runtime/css/base.css'
            ],
            'mediaFiles' => [
                'runtime/assets/ThumbDown.png' => $pciTmpDir . 'runtime/assets/ThumbDown.png',
                'runtime/assets/ThumbUp.png' => $pciTmpDir . 'runtime/assets/ThumbUp.png',
                'runtime/css/img/bg.png' => $pciTmpDir . 'runtime/css/img/bg.png'
            ]
        ]);

        $this->registry->setModel($pciModel);

        $this->registry->register($pciDataObject, $pciTmpDir);

        $this->assertTrue(strlen($this->registry->getBaseUrl($pciDataObject)) > 0);

        $pcis = $this->registry->getLatestRuntimes();

        $isOnRuntime = false;
        foreach ($pcis as $name => $runtime) {
            foreach ($runtime as $key => $runtime_pci) {
                if ($runtime_pci['model'] == $pciDataObject->getModelId()) {
                    $isOnRuntime = true;
                    break;
                }
            }
        }

        $this->assertTrue($isOnRuntime);

        $this->expectException(PortableElementNotFoundException::class);
        $this->assertFalse($this->registry->getBaseUrl(new PciDataObject('likertScaleInteraction', '0.6.1')));
    }

    public function testExport()
    {
        $packageValid = dirname(__FILE__) . '/samples/package/likertScaleInteraction_v1.0.0';

        $pciDataObject = new PciDataObject('likertScaleInteraction', '1.0.0');
        $pciDataObject->setModel(new PciModel());
        $pciDataObject->exchangeArray(json_decode(file_get_contents($packageValid . DIRECTORY_SEPARATOR . PciModel::PCI_MANIFEST), true));

        $service = new PortableElementService();
        $service->setServiceLocator(ServiceManager::getServiceManager());

        $service->registerModel($pciDataObject, $packageValid);

        $exportDirectory = $service->export($pciDataObject->getModelId(), $pciDataObject->getTypeIdentifier());

        $parser = new PciPackagerParser();
        $parser->setModel(new PciModel());
        $source = $parser->extract($exportDirectory);

        $original = $this->fillArrayWithFileNodes(new \DirectoryIterator($packageValid));
        $exported = $this->fillArrayWithFileNodes(new \DirectoryIterator($source));

        $this->assertJsonStringEqualsJsonString(
            file_get_contents($packageValid . DIRECTORY_SEPARATOR . PciModel::PCI_MANIFEST),
            file_get_contents($source . DIRECTORY_SEPARATOR . PciModel::PCI_MANIFEST)
        );

        $this->assertTrue(empty($this->array_diff_assoc_recursive($original, $exported)));
        $service->unregisterModel($pciDataObject);
        \tao_helpers_File::delTree($source);
    }

    function fillArrayWithFileNodes(\DirectoryIterator $dir)
    {
        $data = array();
        foreach ($dir as $node) {
            if ($node->isDir() && !$node->isDot()) {
                $data[$node->getFilename()] = $this->fillArrayWithFileNodes(new \DirectoryIterator($node->getPathname()));
            } elseif ($node->isFile()) {
                $data[] = $node->getFilename();
            }
        }
        return $data;
    }

    protected function array_diff_assoc_recursive($array1, $array2)
    {
        $difference = array();
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
            } elseif (!array_key_exists($key, $array2) || !in_array($value, $array2)) {
                $difference[$key] = $value;
            }
        }
        return $difference;
    }
}
