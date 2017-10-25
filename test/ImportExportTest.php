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
 *
 */

namespace oat\qtiItemPci\test;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\portableElement\exception\PortableElementNotFoundException;
use oat\taoQtiItem\model\portableElement\PortableElementService;
use oat\taoQtiItem\model\qti\asset\handler\PortableAssetHandler;
use oat\taoQtiItem\model\qti\ImportService;
use oat\taoQtiItem\model\qti\Parser;
use oat\taoQtiItem\model\portableElement\parser\itemParser\PortableElementItemParser;
use oat\taoQtiItem\model\Export\QTIPackedItemExporter;
use oat\taoQtiItem\model\QtiItemCompiler;
use \taoItems_models_classes_ItemsService;
use \tao_models_classes_service_FileStorage;
use \ZipArchive;
use oat\taoItems\model\media\LocalItemSource;
use oat\taoQtiItem\model\ItemModel;
use common_report_Report as Report;
use oat\taoQtiItem\model\qti\Service as QtiService;

class ImportExportTest extends TaoPhpUnitTestRunner
{
    public function _testImsLikertV1()
    {
        $packageDir = dirname(__FILE__).'/samples/ims_likert_1/';
        $qtiParser = new Parser($packageDir.'/i150107567172373/qti.xml');
        $portableAssetHandler = new PortableAssetHandler($qtiParser->load(), $packageDir);

        $portableElementService = new PortableElementService();

        $reflectionClass = new \ReflectionClass(PortableAssetHandler::class);
        $reflectionProperty = $reflectionClass->getProperty('portableItemParser');
        $reflectionProperty->setAccessible(true);
        $this->assertInstanceOf(PortableElementItemParser::class, $reflectionProperty->getValue($portableAssetHandler));

        $portableItemParser = $reflectionProperty->getValue($portableAssetHandler);

        $reqs = [
            'likertInteraction/runtime/js/likertInteraction.js',
            'likertInteraction/runtime/js/renderer.js',
            'likertInteraction/runtime/likertConfig.json'
        ];

        //check that required files are
        foreach($reqs as $req){
            $this->assertEquals(true, $portableAssetHandler->isApplicable($req));
            $absPath = $packageDir. '/' . $req;
            $this->assertEquals(false, empty($portableAssetHandler->handle($absPath, $req)));
        }

        //check that not required files are not
        $this->assertEquals(false, $portableAssetHandler->isApplicable('likertScaleInteractionSample/runtime/js/renderer-unexisting.js'));
        $this->assertEquals(false, $portableAssetHandler->isApplicable('oat-pci-unexisting.json'));

        $portableObjects = $portableItemParser->getPortableObjects();

        foreach($portableObjects as $portableObject) {
            try{
                $portableElementService->unregisterModel($portableObject);
            }catch(PortableElementNotFoundException $e){}
        }


        $folder = $packageDir;
        $itemClass = new \core_kernel_classes_Class('http://www.tao.lu/Ontologies/TAOItem.rdf#Item');

//        $qtiItemResources = ImportService::singleton()->createQtiManifest($folder . 'imsmanifest.xml');
//        $report = ImportService::singleton()->importQtiItem(
//            $folder,
//            $qtiItemResource,
//            $itemClass
//        );


        $portableAssetHandler->finalize();
        foreach($portableObjects as $portableObject){
            $retrivedElement = $portableElementService->getPortableElementByIdentifier($portableObject->getModel()->getId(), $portableObject->getTypeIdentifier());
            $this->assertEquals($portableObject->getTypeIdentifier(), $retrivedElement->getTypeIdentifier());

            $portableElementService->unregisterModel($retrivedElement);
        }
    }

    //TODO starting point

    /**
     * @var ImportService
     */
    protected $importService;
    /**
     * @var taoItems_models_classes_ItemsService
     */
    protected $itemService;
    /**
     * @var array
     */
    protected $exportedZips = [];

    protected $importedPcis = [];
    /**
     * @var PortableElementService
     */
    protected $portableElementService;

    /**
     * tests initialization
     * load qti service
     */
    public function setUp()
    {
        TaoPhpUnitTestRunner::initTest();
        $this->importService = ImportService::singleton();
        $this->itemService = taoItems_models_classes_ItemsService::singleton();
        $this->portableElementService = new PortableElementService();
    }

    /**
     * @return string
     */
    protected function getSamplePath($relPath)
    {
        return dirname(__FILE__).DIRECTORY_SEPARATOR.str_replace('/',DIRECTORY_SEPARATOR, $relPath);
    }

    /**
     * @expectedException oat\taoQtiItem\model\portableElement\exception\PortableElementNotFoundException
     */
    public function testInexistingPciLikert(){
        $this->portableElementService->retrieve('PCI', 'oatSamplePciLikert');
    }

    /**
     * @expectedException oat\taoQtiItem\model\portableElement\exception\PortableElementNotFoundException
     */
    public function testInexistingPciAudio(){
        $this->portableElementService->retrieve('PCI', 'oatSamplePciAudio');
    }

    public function testImportPCI()
    {
        $itemClass = $this->itemService->getRootClass();
        $report = $this->importService->importQTIPACKFile(
            $this->getSamplePath('samples/export/oat_pci_likert_audio.zip'),
            $itemClass
        );
        $this->assertEquals(Report::TYPE_SUCCESS, $report->getType());

        $items = array();
        foreach ($report as $itemReport) {
            $this->assertEquals(Report::TYPE_SUCCESS, $itemReport->getType());
            $data = $itemReport->getData();
            if (!is_null($data)) {
                $items[] = $data;
            }
        }
        $this->assertEquals(1, count($items));
        $item = QtiService::singleton()->getDataItemByRdfItem($items[0], DEFAULT_LANG, false);

        $itemData = $item->toArray();

        $likertData = current($itemData['body']['elements']);
        $audioData = end($itemData['body']['elements']);

        //check parsed likert interaction data
        $this->assertEquals('oatSamplePciLikert', $likertData['typeIdentifier']);
        $this->assertEquals('http://www.imsglobal.org/xsd/portableCustomInteraction', $likertData['xmlns']);
        $this->assertEquals('oatSamplePciLikert/runtime/oatSamplePciLikert.min.js', $likertData['entryPoint']);
        $this->assertTrue(empty($likertData['libraries']));
        $this->assertEquals('7', $likertData['properties']['level']);
        $this->assertEquals('Don\'t like', $likertData['properties']['label-min']);
        $this->assertEquals(' Like', $likertData['properties']['label-max']);
        $this->assertEquals(['oatSamplePciLikert/runtime/css/base.css', 'oatSamplePciLikert/runtime/css/oatSamplePciLikert.css'], $likertData['stylesheets']);
        $this->assertEquals(['oatSamplePciLikert/runtime/assets/ThumbDown.png', 'oatSamplePciLikert/runtime/assets/ThumbUp.png', 'oatSamplePciLikert/runtime/css/img/bg.png'], $likertData['mediaFiles']);

        //check parsed audio interaction data
        $this->assertEquals('oatSamplePciAudio', $audioData['typeIdentifier']);
        $this->assertEquals('http://www.imsglobal.org/xsd/portableCustomInteraction', $audioData['xmlns']);
        $this->assertEquals('oatSamplePciAudio/runtime/oatSamplePciAudio.js', $audioData['entryPoint']);
        $this->assertEquals(['oatSamplePciAudio/runtime/js/player', 'oatSamplePciAudio/runtime/js/recorder', 'oatSamplePciAudio/runtime/js/uiElements'], $audioData['libraries']);
        $this->assertEquals(['oatSamplePciAudio/runtime/css/oatSamplePciAudio.css'], $audioData['stylesheets']);
        $this->assertEquals(['oatSamplePciAudio/runtime/img/controls.svg', 'oatSamplePciAudio/runtime/img/mic.svg'], $audioData['mediaFiles']);
        $this->assertEquals([
            'allowPlayback' => 'true',
            'audioBitrate' => '20000',
            'autoStart' => '',
            'displayDownloadLink' => '',
            'maxRecords' => '2',
            'maxRecordingTime' => '120',
            'useMediaStimulus' => '',
            'media' => [
                'autostart' => 'true',
                'replayTimeout' => '5',
                'maxPlays' => '2',
                'loop' => '',
                'maxPlays' => '2',
                'pause' => '',
                'uri' => '',
                'type' => '',
                'height' => '270',
                'width' => '480'
            ],

        ], $audioData['properties']);

        $pciLikert = $this->portableElementService->retrieve('PCI', 'oatSamplePciLikert');
        $this->assertInstanceOf('oat\qtiItemPci\model\portableElement\dataObject\PciDataObject', $pciLikert);

        $pciAudio = $this->portableElementService->retrieve('PCI', 'oatSamplePciAudio');
        $this->assertInstanceOf('oat\qtiItemPci\model\portableElement\dataObject\PciDataObject', $pciAudio);

        return $items[0];
    }

    public function _testImport()
    {
        $itemClass = $this->itemService->getRootClass();
        $report = $this->importService->importQTIPACKFile($this->getSamplePath('/package/QTI/package.zip'),
            $itemClass);

        $items = array();
        foreach ($report as $itemReport) {
            $data = $itemReport->getData();
            if (!is_null($data)) {
                $items[] = $data;
            }
        }
        $this->assertEquals(1, count($items));

        $item = current($items);
        $this->assertInstanceOf('\core_kernel_classes_Resource', $item);
        $this->assertTrue($item->exists());

        $resourceManager = new LocalItemSource(
            array( 'item' => $item,
                'lang' =>DEFAULT_LANG)
        );
        $data = $resourceManager->getDirectory();
        $this->assertTrue(is_array($data));
        $this->assertTrue(isset($data['path']));
        $this->assertEquals('/', $data['path']);

        $this->assertTrue(isset($data['children']));
        $children = $data['children'];
        $this->assertEquals(3, count($children));

        $check = array('/images/','/style/');

        $file = null;
        $dir = null;
        foreach ($children as $child) {
            if (isset($child['path'])) {
                $this->assertContains($child['path'],$check);
            }
            if (isset($child['name'])) {
                $file = $child;
            }
        }

        $this->assertEquals("qti.xml", $file['name']);
        $this->assertContains("/xml", $file['mime']);
        $this->assertTrue($file['size'] > 0);


        return $item;
    }

    /**
     * @depends testImportPCI
     * @param $item
     */
    public function testCompile($item)
    {
        $storage = tao_models_classes_service_FileStorage::singleton();
        $compiler = new QtiItemCompiler($item, $storage);
        $report = $compiler->compile();
        $this->assertEquals($report->getType(), Report::TYPE_SUCCESS);
        $serviceCall = $report->getData();
        $this->assertNotNull($serviceCall);
        $this->assertInstanceOf('\tao_models_classes_service_ServiceCall', $serviceCall);
    }

    /**
     * @depends testImportPCI
     * @param $item
     * @throws Exception
     * @throws \oat\taoQtiItem\model\qti\exception\ExtractException
     * @throws \oat\taoQtiItem\model\qti\exception\ParsingException
     * @return mixed
     */
    public function testExportPCI($item)
    {
        $itemClass = $this->itemService->getRootClass();

        list($path, $manifest) = $this->createZipArchive($item);

        $report = $this->importService->importQTIPACKFile($path, $itemClass);
        $this->assertEquals(Report::TYPE_SUCCESS, $report->getType());
        $items = array();
        foreach ($report as $itemReport) {
            $data = $itemReport->getData();
            if (!is_null($data)) {
                $items[] = $data;
            }
        }
        $this->assertEquals(1, count($items));
        $item2 = current($items);
        $this->assertInstanceOf('\core_kernel_classes_Resource', $item);
        $this->assertTrue($item->exists());

        $this->assertEquals($item->getLabel(), $item2->getLabel());

        $this->readZipArchive($path, $item);

        $this->removeItem($item2);

        return $manifest;
    }

    /**
     * @depends testImportPCI
     */
    public function testRemoveItem()
    {
        foreach (func_get_args() as $item) {
            $this->removeItem($item);
        }
    }

    public function testRemovePci(){

        $pciLikert = $this->portableElementService->retrieve('PCI', 'oatSamplePciLikert');
        $this->assertInstanceOf('oat\qtiItemPci\model\portableElement\dataObject\PciDataObject', $pciLikert);

        $pciAudio = $this->portableElementService->retrieve('PCI', 'oatSamplePciAudio');
        $this->assertInstanceOf('oat\qtiItemPci\model\portableElement\dataObject\PciDataObject', $pciAudio);

        $this->portableElementService->unregisterModel($pciLikert);
        $this->portableElementService->unregisterModel($pciAudio);
    }

    private function removeItem($item)
    {
        $this->itemService->deleteItem($item);
        $this->assertFalse($item->exists());
    }

    public function tearDown()
    {
        foreach ($this->exportedZips as $path) {
            if (file_exists($path)) {
                $this->assertTrue(unlink($path));
            }
        }
    }

    /**
     * @param $item
     * @param $manifest
     * @return array
     * @throws \Exception
     */
    private function createZipArchive($item, $manifest = null)
    {
        $path = sys_get_temp_dir() . DIRECTORY_SEPARATOR. uniqid('test_') . '.zip';
        $zipArchive = new ZipArchive();
        if ($zipArchive->open($path, ZipArchive::CREATE) !== true) {
            throw new \common_Exception('Unable to create archive at ' . $path);
        }

        if ($this->itemService->hasItemModel($item, array(ItemModel::MODEL_URI))) {
            $exporter = new QTIPackedItemExporter($item, $zipArchive, $manifest);
            $exporter->export();
            $manifest = $exporter->getManifest();
        }

        $this->assertTrue($this->itemService->hasItemModel($item, array(ItemModel::MODEL_URI)));

        $this->assertNotNull($manifest);

        $this->assertEquals(ZipArchive::ER_OK, $zipArchive->status, $zipArchive->getStatusString());

        $zipArchive->close();
        $this->assertTrue(file_exists($path),'could not find path ' . $path);
        $this->exportedZips[] = $path;
        return array($path, $manifest);
    }

    private function readZipArchive($source, \core_kernel_classes_Resource $item){

        $this->assertTrue(file_exists($source), 'could not find path ' . $source);
        $itemFolder = \tao_helpers_Uri::getUniqueId($item->getUri());
        $zip = new ZipArchive();
        $this->assertNotFalse($zip->open($source), 'cannot open item zip package');

        $qtiXml = $itemFolder.'/qti.xml';
        $this->assertNotFalse($zip->locateName($qtiXml), 'cannot find qti xml');
        $this->assertNotFalse($zip->locateName('imsmanifest.xml'), 'cannot find manifest xml');

        $content = $zip->getFromName($qtiXml);
        $this->assertNotEmpty($content);

        return $content;
    }

}