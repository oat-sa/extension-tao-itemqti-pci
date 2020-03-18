<?php

namespace oat\qtiItemPci\test\integration;

use oat\qtiItemPci\controller\PciManager;
use oat\qtiItemPci\model\IMSPciModel;
use oat\qtiItemPci\model\ItemsScannerService;
use oat\qtiItemPci\model\PciModel;
use oat\qtiItemPci\model\portableElement\dataObject\PciDataObject;
use oat\qtiItemPci\model\portableElement\storage\PciRegistry;
use oat\generis\test\GenerisTestCase;
use oat\taoQtiItem\model\portableElement\exception\PortableElementException;
use oat\taoQtiItem\model\portableElement\model\PortableElementModel;
use oat\taoQtiItem\model\portableElement\PortableElementService;
use oat\taoQtiItem\model\portableElement\storage\PortableElementRegistry;
use oat\generis\test\MockObject;
use oat\taoQtiItem\model\qti\ImportService;

class PciManagerTest extends GenerisTestCase
{
    const PRODUCT_NAME = 'TAO';

    /**
     * @var \Request|MockObject
     */
    private $requestMock;
    private $ontologyMock;
    /**
     * @var \taoItems_models_classes_ItemsService
     */
    private $itemsService;

    /**
     * @var PortableElementService
     */
    private $portableElementService;

    /**
     * @var \taoTests_models_classes_TestsService
     */
    private $testService;

    /**
     * @var ImportService
     */
    private $importService;

    /**
     * @throws \common_ext_ExtensionException
     */
    public function setUp(): void
    {
        $this->ontologyMock = $this->getOntologyMock();
        $this->requestMock = $this->createMock(\Request::class);
        $this->itemsService = \taoItems_models_classes_ItemsService::singleton();
        $this->itemsService->setModel($this->ontologyMock);
        $this->portableElementService = new PortableElementService();
        $this->testService = \taoTests_models_classes_TestsService::singleton();
        $this->importService = ImportService::singleton();
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');
    }

    public function testUnregisterRequestWithoutParameter()
    {
        $this->expectException(PortableElementException::class);
        $this->requestMock
            ->expects($this->once())
            ->method('hasParameter')
            ->with($this->equalTo('typeIdentifier'))
            ->willReturn(false);

        $pciManager = new PciManagerForTest($this->requestMock);
        $pciManager->unregister();
    }

    private function createRequestMockWithTypeIdentifier()
    {
        $this->requestMock
            ->expects($this->once())
            ->method('hasParameter')
            ->with($this->equalTo('typeIdentifier'))
            ->willReturn(true);

        $this->requestMock
            ->method('getParameter')
            ->with($this->equalTo('typeIdentifier'))
            ->willReturn('likertScaleInteraction');
    }

    /**
     * @runInSeparateProcess
     */
    public function testUnregister()
    {
        $this->createRequestMockWithTypeIdentifier();
        $pciModelMock = $this->createMock(PciModel::class);
        $IMSPciModelMock = $this->createMock(IMSPciModel::class);
        $pciDataObjectMock = $this->createMock(PciDataObject::class);
        $portableElementModelMock = $this->createMock(PortableElementModel::class);
        $portableElementRegistryMock = $this->createMock(PortableElementRegistry::class);
        $pciDataObjectMock->method('getModel')->willReturn($portableElementModelMock);
        $portableElementModelMock->method('getRegistry')->willReturn($portableElementRegistryMock);
        $portableElementRegistryMock->method('delete');

        $pciRegistryMock = $this->createMock(PciRegistry::class);
        $pciRegistryMock
            ->method('getLatestVersion')
            ->with('likertScaleInteraction')
            ->willReturn($pciDataObjectMock);

        $pciModelMock->method('getRegistry')->willReturn($pciRegistryMock);

        $pciModels = [
            $pciModelMock, $IMSPciModelMock
        ];

        $pciManager = new PciManagerForTest($this->requestMock, $pciModels);
        $pciManager->unregister();
    }
}


class PciManagerForTest extends PciManager
{
    protected $request;
    /**
     * @var array
     */
    private $pciModels;

    public function __construct(\Request $request, array $pciModels = [])
    {
        parent::__construct();
        $this->request = $request;
        $this->pciModels = $pciModels;
    }

    protected function getPciModels()
    {
        return $this->pciModels;
    }

    public function getRequest()
    {
        return $this->request;
    }
}
