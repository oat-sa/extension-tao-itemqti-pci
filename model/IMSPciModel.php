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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\qtiItemPci\model;

use oat\oatbox\service\ServiceManager;
use oat\oatbox\PhpSerializeStateless;
use oat\qtiItemPci\model\portableElement\dataObject\IMSPciDataObject;
use oat\qtiItemPci\model\portableElement\storage\IMSPciRegistry;
use oat\qtiItemPci\model\portableElement\validator\IMSPciValidator;
use oat\taoQtiItem\model\portableElement\model\PortableElementModel;

class IMSPciModel implements PortableElementModel
{
    use PhpSerializeStateless;

    const PCI_IDENTIFIER = 'IMSPCI';

    const PCI_MANIFEST = 'pciCreator.json';

    const PCI_ENGINE = 'pciCreator.js';

    public function getId()
    {
        return self::PCI_IDENTIFIER;
    }

    public function getDefinitionFiles()
    {
        return [
            self::PCI_MANIFEST,
            self::PCI_ENGINE
        ];
    }

    public function getManifestName()
    {
        return self::PCI_MANIFEST;
    }

    public function createDataObject(array $data)
    {
        $object = (new IMSPciDataObject())->exchangeArray($data);
        $object->setModel($this);
        return $object;
    }

    public function getRegistry()
    {
        /** @var IMSPciRegistry $registry */
        $registry = IMSPciRegistry::getRegistry($this);
        $registry->setServiceLocator(ServiceManager::getServiceManager());
        $registry->setModel($this);
        return $registry;
    }

    public function getValidator()
    {
        return new IMSPciValidator();
    }

    public function getDirectoryParser()
    {
        //not available yet
        return null;
    }

    public function getPackageParser()
    {
        //not available yet
        return null;
    }

    public function getQtiElementClassName()
    {
        return 'oat\taoQtiItem\model\qti\interaction\ImsPortableCustomInteraction';
    }
}