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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\qtiItemPci\model;

use oat\oatbox\service\ServiceManager;
use oat\qtiItemPci\model\portableElement\dataObject\PciDataObject;
use oat\qtiItemPci\model\portableElement\parser\PciDirectoryParser;
use oat\qtiItemPci\model\portableElement\parser\PciPackagerParser;
use oat\qtiItemPci\model\portableElement\storage\PciRegistry;
use oat\qtiItemPci\model\portableElement\validator\PciValidator;
use oat\taoQtiItem\model\portableElement\storage\PortableElementRegistry;
use oat\taoQtiItem\model\portableElement\model\PortableElementModel;
use oat\oatbox\PhpSerializeStateless;

class PciModel implements PortableElementModel
{
    use PhpSerializeStateless;

    const PCI_IDENTIFIER = 'PCI';

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
        $object = (new PciDataObject())->exchangeArray($data);
        $object->setModel($this);
        return $object;
    }

    public function getRegistry()
    {
        /** @var PortableElementRegistry $registry */
        $registry = PciRegistry::getRegistry($this);
        $registry->setServiceLocator(ServiceManager::getServiceManager());
        $registry->setModel($this);
        return $registry;
    }

    public function getValidator()
    {
        return new PciValidator();
    }

    public function getDirectoryParser()
    {
        $directoryParser = new PciDirectoryParser();
        $directoryParser->setModel($this);
        return $directoryParser;
    }

    public function getPackageParser()
    {
        $packageParser = new PciPackagerParser();
        $packageParser->setModel($this);
        return $packageParser;
    }

    public function getQtiElementClassName()
    {
        return 'oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction';
    }
}