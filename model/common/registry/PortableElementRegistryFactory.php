<?php

namespace oat\qtiItemPci\model\common\registry;

use oat\oatbox\service\ConfigurableService;
use oat\oatbox\service\ServiceManager;
use oat\qtiItemPci\model\common\model\PortableElementModel;
use oat\qtiItemPci\model\pci\model\PciModel;
use oat\qtiItemPci\model\pic\model\PicModel;

class PortableElementRegistryFactory extends ConfigurableService
{
    const SERVICE_ID = 'qtiItemPci/portableElementRegistry';

    const PCI_IMPLEMENTATION = 'pciRegistry';
    const PIC_IMPLEMENTATION = 'picRegistry';

    public function getRegistry(PortableElementModel $model)
    {
        switch (get_class($model)) {
            case PciModel::class :
                $registry = $this->getOption(self::PCI_IMPLEMENTATION);
                break;
            case PicModel::class :
                $registry = $this->getOption(self::PIC_IMPLEMENTATION);
                break;
            default:
                throw new \common_Exception('Unable to load registry implementation for model ' . get_class($model));
                break;
        }
        $registry->setServiceLocator(ServiceManager::getServiceManager());
        return $registry;
    }
}