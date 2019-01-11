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

namespace oat\qtiItemPci\test\integration;

use oat\oatbox\service\ServiceManager;
use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\portableElement\exception\PortableElementNotFoundException;
use oat\taoQtiItem\model\portableElement\PortableElementService;
use oat\taoQtiItem\model\qti\ImportService;
use oat\taoQtiItem\model\Export\QTIPackedItemExporter;
use oat\taoQtiItem\model\QtiItemCompiler;
use \RecursiveDirectoryIterator;
use \RecursiveIteratorIterator;
use \taoItems_models_classes_ItemsService;
use \tao_models_classes_service_FileStorage;
use \ZipArchive;
use oat\taoQtiItem\model\ItemModel;
use common_report_Report as Report;
use oat\taoQtiItem\model\qti\Service as QtiService;

class ImportExportTest extends TaoPhpUnitTestRunner
{
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
        return dirname(__FILE__) . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relPath);
    }

    public function testImportOatPci()
    {
        $itemClass = $this->itemService->getRootClass();
        $report = $this->importService->importQTIPACKFile(
            $this->createZipFromDir($this->getSamplePath('samples/export/oat_pci_likert_audio')),
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

    public function testImportImsPci()
    {
        $itemClass = $this->itemService->getRootClass();
        $report = $this->importService->importQTIPACKFile(
            $this->createZipFromDir($this->getSamplePath('samples/export/ims_pci_likert')),
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

        //check parsed likert interaction data
        $this->assertEquals('urn:oat:pci:likert', $likertData['typeIdentifier']);
        $this->assertEquals('http://www.imsglobal.org/xsd/portableCustomInteraction_v1', $likertData['xmlns']);
        $this->assertEquals(['../oat-pci.json'], $likertData['config']);
        $this->assertEquals(['imsSamplePciLikert/runtime/js/imsSamplePciLikert', 'imsSamplePciLikert/runtime/js/renderer', 'jquery_2_1_1'], array_keys($likertData['modules']));
        $this->assertEquals(['level' => '5', 'label-min' => 'min', 'label-max' => 'max'], $likertData['properties']);

        $pciLikert = $this->portableElementService->retrieve('IMSPCI', 'urn:oat:pci:likert');
        $this->assertInstanceOf('oat\qtiItemPci\model\portableElement\dataObject\IMSPciDataObject', $pciLikert);

        return $items[0];
    }

    /**
     * @depends testImportOatPci
     * @param $item
     */
    public function testCompile($item)
    {
        $storage = tao_models_classes_service_FileStorage::singleton();
        $compiler = new QtiItemCompiler($item, $storage);
        $compiler->setServiceLocator(ServiceManager::getServiceManager());
        $report = $compiler->compile();
        $this->assertEquals($report->getType(), Report::TYPE_SUCCESS);
        $serviceCall = $report->getData();
        $this->assertNotNull($serviceCall);
        $this->assertInstanceOf('\tao_models_classes_service_ServiceCall', $serviceCall);
    }

    /**
     * @depends testImportOatPci
     * @param $item
     * @throws Exception
     * @throws \oat\taoQtiItem\model\qti\exception\ExtractException
     * @throws \oat\taoQtiItem\model\qti\exception\ParsingException
     * @return mixed
     */
    public function testExportOatPci($item)
    {
        $itemClass = $this->itemService->getRootClass();

        list($path, $manifest) = $this->exportItemZip($item);

        $zipContent = $this->readZipArchive($path, $item);
        $itemFolder = $this->getItemFolder($item);

        $this->assertEquals([
            $itemFolder . '/oatSamplePciLikert/runtime/oatSamplePciLikert.min.js',
            $itemFolder . '/oatSamplePciLikert/runtime/css/base.css',
            $itemFolder . '/oatSamplePciLikert/runtime/css/oatSamplePciLikert.css',
            $itemFolder . '/oatSamplePciLikert/runtime/assets/ThumbDown.png',
            $itemFolder . '/oatSamplePciLikert/runtime/assets/ThumbUp.png',
            $itemFolder . '/oatSamplePciLikert/runtime/css/img/bg.png',
            $itemFolder . '/oatSamplePciAudio/runtime/oatSamplePciAudio.js',
            $itemFolder . '/oatSamplePciAudio/runtime/js/player.js',
            $itemFolder . '/oatSamplePciAudio/runtime/js/recorder.js',
            $itemFolder . '/oatSamplePciAudio/runtime/js/uiElements.js',
            $itemFolder . '/oatSamplePciAudio/runtime/css/oatSamplePciAudio.css',
            $itemFolder . '/oatSamplePciAudio/runtime/img/controls.svg',
            $itemFolder . '/oatSamplePciAudio/runtime/img/mic.svg',
            $itemFolder . '/who02.jpg',
            $itemFolder . '/style/custom/tao-user-styles.css',
            $itemFolder . '/qti.xml',
            'imsmanifest.xml'
        ], $zipContent['files']);

        $manifestDoc = new \DOMDocument();
        $manifestDoc->loadXML($zipContent['manifest']);
        $this->assertEquals(16, $manifestDoc->getElementsByTagName('file')->length);

        $report = $this->importService->importQTIPACKFile($path, $itemClass);
        if ($report->getType() !== Report::TYPE_SUCCESS) {
            echo \helpers_Report::renderToCommandLine($report);
        }
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

        $this->removeItem($item2);

        return $manifest;
    }

    /**
     * @depends testImportImsPci
     * @param $item
     * @throws Exception
     * @throws \oat\taoQtiItem\model\qti\exception\ExtractException
     * @throws \oat\taoQtiItem\model\qti\exception\ParsingException
     * @return mixed
     */
    public function testExportImsPci($item)
    {
        $itemClass = $this->itemService->getRootClass();

        list($path, $manifest) = $this->exportItemZip($item);


        $zipContent = $this->readZipArchive($path, $item);
        $itemFolder = $this->getItemFolder($item);

        $this->assertEquals([
            'imsSamplePciLikert/runtime/js/imsSamplePciLikert.js',
            'imsSamplePciLikert/runtime/js/renderer.js',
            'portableLib/jquery_2_1_1.js',
            $itemFolder . '/imsSamplePciLikert/runtime/assets/ThumbDown.png',
            $itemFolder . '/imsSamplePciLikert/runtime/assets/ThumbUp.png',
            $itemFolder . '/imsSamplePciLikert/runtime/css/img/bg.png',
            $itemFolder . '/style/custom/tao-user-styles.css',
            $itemFolder . '/imsSamplePciLikert/runtime/css/base.css',
            $itemFolder . '/imsSamplePciLikert/runtime/css/imsSamplePciLikert.css',
            'oat-pci.json',
            $itemFolder . '/qti.xml',
            'imsmanifest.xml'
        ], $zipContent['files']);

        //check manifest
        $manifestDoc = new \DOMDocument();
        $manifestDoc->loadXML($zipContent['manifest']);
        $this->assertEquals(11, $manifestDoc->getElementsByTagName('file')->length);

        $report = $this->importService->importQTIPACKFile($path, $itemClass);
        if ($report->getType() !== Report::TYPE_SUCCESS) {
            echo \helpers_Report::renderToCommandLine($report);
        }
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

        $this->removeItem($item2);

        return $manifest;
    }

    /**
     * @depends testImportOatPci
     * @depends testImportImsPci
     */
    public function testRemoveItem()
    {
        foreach (func_get_args() as $item) {
            $this->removeItem($item);
        }
    }

    public function testRemovePci()
    {

        $pciLikert = $this->portableElementService->retrieve('PCI', 'oatSamplePciLikert');
        $this->assertInstanceOf('oat\qtiItemPci\model\portableElement\dataObject\PciDataObject', $pciLikert);

        $pciAudio = $this->portableElementService->retrieve('PCI', 'oatSamplePciAudio');
        $this->assertInstanceOf('oat\qtiItemPci\model\portableElement\dataObject\PciDataObject', $pciAudio);

        $pciImsLikert = $this->portableElementService->retrieve('IMSPCI', 'urn:oat:pci:likert');
        $this->assertInstanceOf('oat\qtiItemPci\model\portableElement\dataObject\IMSPciDataObject', $pciImsLikert);

        $this->portableElementService->unregisterModel($pciLikert);
        $this->portableElementService->unregisterModel($pciAudio);
        $this->portableElementService->unregisterModel($pciImsLikert);
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

    private function createZipFromDir($dir)
    {

        $rootPath = realpath($dir);

        $path = sys_get_temp_dir() . DIRECTORY_SEPARATOR . uniqid('item_') . '.zip';

        $zip = new ZipArchive();
        $zip->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($rootPath),
            RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($files as $name => $file) {
            if (!$file->isDir()) {
                $filePath = $file->getRealPath();
                $relativePath = substr($filePath, strlen($rootPath) + 1);
                $zip->addFile($filePath, $relativePath);
            }
        }

        $zip->close();
        $this->assertTrue(file_exists($path), 'could not find create zip from dir ' . $dir . ' to ' . $path);

        $this->exportedZips[] = $path;

        return $path;
    }

    /**
     * @param $item
     * @param $manifest
     * @return array
     * @throws \Exception
     */
    private function exportItemZip($item, $manifest = null)
    {
        $path = sys_get_temp_dir() . DIRECTORY_SEPARATOR . uniqid('test_') . '.zip';
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
        $this->assertTrue(file_exists($path), 'could not find path ' . $path);
        $this->exportedZips[] = $path;

        return array($path, $manifest);
    }

    private function getItemFolder($item)
    {
        return \tao_helpers_Uri::getUniqueId($item->getUri());
    }

    private function readZipArchive($source, \core_kernel_classes_Resource $item)
    {

        $manifestFile = 'imsmanifest.xml';
        $this->assertTrue(file_exists($source), 'could not find path ' . $source);
        $zip = new ZipArchive();
        $this->assertNotFalse($zip->open($source), 'cannot open item zip package');

        $qtiXml = $this->getItemFolder($item) . '/qti.xml';
        $this->assertNotFalse($zip->locateName($qtiXml), 'cannot find qti xml');
        $this->assertNotFalse($zip->locateName($manifestFile), 'cannot find manifest xml');

        //check the item content is not empty
        $content = $zip->getFromName($qtiXml);
        $this->assertNotEmpty($content);

        //check the item content is not empty
        $manifest = $zip->getFromName($manifestFile);
        $this->assertNotEmpty($manifest);

        $files = [];
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $files[] = $zip->getNameIndex($i);
        }

        if ($zip->locateName('oat-pci.json')) {
            \common_Logger::d('portable element manifest: ' . $zip->getFromName('oat-pci.json'));
        }

        return [
            'files' => $files,
            'item' => $content,
            'manifest' => $manifest
        ];
    }


}