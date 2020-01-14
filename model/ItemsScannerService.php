<?php

namespace oat\qtiItemPci\model;

use oat\taoQtiItem\model\portableElement\exception\PortableElementException;
use oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction;
use oat\taoQtiItem\model\qti\Service as QtiService;

/**
 * Scan items for desire content
 * Class ItemsScannerService
 * @author Bartlomiej Marszal
 */
class ItemsScannerService
{
    /**
     * @var QtiService
     */
    private $qtiService;

    /**
     * ItemsScannerService constructor.
     * @param QtiService $qtiServiceSingleton
     */
    public function __construct(QtiService $qtiServiceSingleton)
    {
        $this->qtiService = $qtiServiceSingleton;
    }

    /**
     * @param string $requestTypeIndentifier
     * @param array $allItems
     * @throws \common_Exception
     * @throws \common_exception_Error
     */
    public function isPciUsedInItems($requestTypeIndentifier, array $allItems)
    {
        foreach ($allItems as $key => $item) {
            if ($this->qtiService->getDataItemByRdfItem($this->getItemResource($key)) !== null) {
                $interactions = $this->qtiService->getDataItemByRdfItem($this->getItemResource($key))->getInteractions();
                foreach ($interactions as $interaction) {
                    if (
                        $interaction instanceof PortableCustomInteraction
                        && $requestTypeIndentifier === $interaction->getTypeIdentifier()
                    ) {
                        throw new PortableElementException('Portable element is used in one of items');
                    }
                }
            }
        }
    }

    /**
     * @param string|\core_kernel_classes_Container $key
     * @return \core_kernel_classes_Resource
     * @throws \common_exception_Error
     */
    protected function getItemResource($key)
    {
        return new \core_kernel_classes_Resource($key);
    }
}
