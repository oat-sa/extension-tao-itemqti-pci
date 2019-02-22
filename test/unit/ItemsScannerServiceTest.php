<?php

namespace oat\qtiItemPci\model\test\unit;

use oat\generis\test\GenerisTestCase;
use oat\qtiItemPci\model\ItemsScannerService;
use oat\taoQtiItem\model\qti\interaction\Interaction;
use oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\Service as QtiService;

class ItemsScannerServiceTest extends GenerisTestCase
{

    /**
     * @var QtiService|\PHPUnit_Framework_MockObject_MockObject
     */
    private $qtiServiceMock;

    /**
     * @var Item|\PHPUnit_Framework_MockObject_MockObject
     */
    private $itemMock;

    /**
     * @var \core_kernel_classes_Resource|\PHPUnit_Framework_MockObject_MockObject
     */
    private $itemResourceMock;
    /**
     * @var PortableCustomInteraction|\PHPUnit_Framework_MockObject_MockObject
     */
    private $portableInteraction;

    /**
     * @var Interaction|\PHPUnit_Framework_MockObject_MockObject
     */
    private $interactionMock;

    protected function setUp()
    {
        $this->qtiServiceMock = $this->createMock(QtiService::class);
        $this->itemMock = $this->createMock(Item::class);
        $this->itemResourceMock = $this->createMock(\core_kernel_classes_Resource::class);
        $this->interactionMock = $this->createMock(Interaction::class);
        $this->portableInteraction = $this->createMock(PortableCustomInteraction::class);
    }

    /**
     * @test
     * @expectedException oat\taoQtiItem\model\portableElement\exception\PortableElementException
     */
    public function isPciUsedInItemsTest()
    {
        $allItems = [
            'key' => 'value',
            'otherKey' => 'otherValue'
        ];
        $this->portableInteraction->method('getTypeIdentifier')->willReturn('someString');
        $interactions = [
            $this->interactionMock,
            $this->portableInteraction
        ];
        $this->itemMock->method('getInteractions')->willReturn($interactions);
        $this->qtiServiceMock->method('getDataItemByRdfItem')->willReturn($this->itemMock);

        $itemsScannerService = new ItemsScannerServiceForTest($this->qtiServiceMock, $this->itemResourceMock);

        $itemsScannerService->isPciUsedInItems('someString', $allItems);
    }
}

class ItemsScannerServiceForTest extends ItemsScannerService
{
    /**
     * @var \core_kernel_classes_Resource
     */
    private $itemResourceMock;

    /**
     * ItemsScannerServiceForTest constructor.
     * @param QtiService $qtiServiceSingleton
     * @param null $itemResourceMock
     */
    public function __construct(QtiService $qtiServiceSingleton, $itemResourceMock = null)
    {
        parent::__construct($qtiServiceSingleton);
        $this->itemResourceMock = $itemResourceMock;
    }

    /**
     * Replace method in origin class with mock resource
     *
     * @param $key
     * @return \core_kernel_classes_Resource|null
     */
    protected function getItemResource($key)
    {
        return $this->itemResourceMock;
    }
}
