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

namespace oat\qtiItemPci\model\portableElement\export;

use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\portableElement\PortableElementService;
use oat\taoQtiItem\model\portableElement\export\PortableElementExporter;
use oat\taoQtiItem\model\portableElement\element\PortableElementObject;
use \DOMDocument;
use \DOMXPath;

class OatPciExporter extends PortableElementExporter{

    /**
     * Copy the asset files of the PCI to the item exporter and return the list of copied assets
     * @param $replacementList
     * @return array
     * @throws \oat\taoQtiItem\model\portableElement\exception\PortableElementInvalidAssetException
     */
    public function copyAssetFiles(&$replacementList){
        $object = $this->object;
        $portableAssetsToExport = [];
        $service = new PortableElementService();
        $service->setServiceLocator(ServiceManager::getServiceManager());
        $files = $object->getModel()->getValidator()->getAssets($object, 'runtime');
        $baseUrl = $this->qtiItemExporter->buildBasePath() . DIRECTORY_SEPARATOR . $object->getTypeIdentifier();
        foreach ($files as $url) {
            // Skip shared libraries into portable element
            if (strpos($url, './') !== 0) {
                \common_Logger::i('Shared libraries skipped : ' . $url);
                $portableAssetsToExport[$url] = $url;
                continue;
            }
            $stream = $service->getFileStream($object, $url);
            $replacement = $this->qtiItemExporter->copyAssetFile($stream, $baseUrl, $url, $replacementList);
            $portableAssetToExport = preg_replace('/^(.\/)(.*)/', $object->getTypeIdentifier() . "/$2", $replacement);
            $portableAssetsToExport[$url] = $portableAssetToExport;
            \common_Logger::i('File copied: "' . $url . '" for portable element ' . $object->getTypeIdentifier());
        }
        return $this->portableAssetsToExport = $portableAssetsToExport;
    }

    public function getNodeName(){
        return 'portableCustomInteraction';
    }

    public function getTypeIdentifierAttributeName(){
        return 'customInteractionTypeIdentifier';
    }

    public function getXmlnsName(){
        return 'pci';
    }

    public function exportDom(DOMDocument $dom){

        // If asset files list is empty for current identifier skip
        if (empty($this->portableAssetsToExport)){
            return;
        }

        $xpath = new DOMXPath($dom);

        // Get all portable element from qti.xml
        $portableElementNodes = $dom->getElementsByTagName($this->getNodeName());

        /** @var PortableElementObject $portableElement */
        $portableElement = $this->object;

        for ($i=0; $i<$portableElementNodes->length; $i++) {

            /** @var \DOMElement $currentPortableNode */
            $currentPortableNode = $portableElementNodes->item($i);

            //get the local namespace prefix to be used in new node creation
            $localNs = $currentPortableNode->hasAttribute('xmlns') ? '' : $this->getXmlnsName().':';

            //get the portable element type identifier
            $identifier = $currentPortableNode->getAttribute($this->getTypeIdentifierAttributeName());

            if($identifier != $portableElement->getTypeIdentifier()){
                continue;
            }

            // Add hook and version as attributes
            if ($portableElement->hasRuntimeKey('hook'))
                $currentPortableNode->setAttribute('hook',
                    preg_replace('/^(.\/)(.*)/', $portableElement->getTypeIdentifier() . "/$2",
                        $portableElement->getRuntimeKey('hook')
                    )
                );

            //set version
            $currentPortableNode->setAttribute('version', $portableElement->getVersion());

            /** @var \DOMElement $resourcesNode */
            $resourcesNode = $currentPortableNode->getElementsByTagName('resources')->item(0);

            $this->removeOldNode($resourcesNode, 'libraries');
            $this->removeOldNode($resourcesNode, 'stylesheets');
            $this->removeOldNode($resourcesNode, 'mediaFiles');

            // Portable libraries
            $librariesNode = $dom->createElement($localNs . 'libraries');
            foreach ($portableElement->getRuntimeKey('libraries') as $library) {
                $libraryNode = $dom->createElement($localNs . 'lib');
                //the exported lib id must be adapted from a href mode to an amd name mode
                $libraryNode->setAttribute('id', preg_replace('/\.js$/', '', $this->getOatPciExportPath($library)));
                $librariesNode->appendChild($libraryNode);
            }
            if ($librariesNode->hasChildNodes()) {
                $resourcesNode->appendChild($librariesNode);
            }

            // Portable stylesheets
            $stylesheetsNode = $dom->createElement($localNs . 'stylesheets');
            foreach ($portableElement->getRuntimeKey('stylesheets') as $stylesheet) {
                $stylesheetNode = $dom->createElement($localNs . 'link');
                $stylesheetNode->setAttribute('href', $this->getOatPciExportPath($stylesheet));
                $stylesheetNode->setAttribute('type', 'text/css');

                $info = pathinfo($stylesheet);
                $stylesheetNode->setAttribute('title', basename($stylesheet, '.' . $info['extension']));
                $stylesheetsNode->appendChild($stylesheetNode);
            }
            if ($stylesheetsNode->hasChildNodes()) {
                $resourcesNode->appendChild($stylesheetsNode);
            }

            // Portable mediaFiles
            $mediaFilesNode = $dom->createElement($localNs . 'mediaFiles');
            foreach ($portableElement->getRuntimeKey('mediaFiles') as $mediaFile) {
                $mediaFileNode = $dom->createElement($localNs . 'file');
                $mediaFileNode->setAttribute('src', $this->getOatPciExportPath($mediaFile));
                $mediaFileNode->setAttribute('type', \tao_helpers_File::getMimeType($this->getOatPciExportPath($mediaFile)));
                $mediaFilesNode->appendChild($mediaFileNode);
            }
            if ($mediaFilesNode->hasChildNodes()) {
                $resourcesNode->appendChild($mediaFilesNode);
            }

        }

        unset($xpath);
    }

    private function getOatPciExportPath($file){
        return $this->portableAssetsToExport[preg_replace('/^'.$this->object->getTypeIdentifier().'\//', './', $file)];
    }
}