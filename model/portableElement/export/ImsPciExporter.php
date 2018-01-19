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

class ImsPciExporter extends PortableElementExporter{

    /**
     * Cope the asset files of the PCI to the item exporter and return the list of copied assets
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
        $baseUrl = '';//add pcis to the root of the package
        foreach ($files as $url) {
            $stream = $service->getFileStream($object, $url);
            $replacement = $this->qtiItemExporter->copyAssetFile($stream, $baseUrl, $url, $replacementList);
            $portableAssetsToExport[$url] = $replacement;
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

            $basePath = $this->qtiItemExporter->buildBasePath();
            $itemRelPath = $this->getItemRelativePath($basePath);

            //set version
            $currentPortableNode->setAttribute('data-version', $portableElement->getVersion());

            /** @var \DOMElement $resourcesNode */
            $modulesNode = $currentPortableNode->getElementsByTagName('modules')->item(0);

            $this->removeOldNode($modulesNode, 'module');

            $runtime = $portableElement->getRuntime();
            if(isset($runtime['config'])){
                $configs = $runtime['config'];

                if(isset($configs[0])){
                    $file = $configs[0]['file'];
                    $finalRelPath = $this->getImsPciExportPath($itemRelPath, $file);
                    //make this path relative to the item !
                    $modulesNode->setAttribute('primaryConfiguration', $finalRelPath);

                    if(isset($configs[0]['data']) && isset($configs[0]['data']['paths'])){
                        foreach($configs[0]['data']['paths'] as $id => $paths){
                            if(is_string($paths)){
                                $adaptedPath = $this->getRawExportPath($paths);
                                $paths = $this->getRelPath($file, $adaptedPath);
                            }else if(is_array($paths)){
                                for($i = 0; $i< count($paths) ; $i ++){
                                    $paths[$i] = $this->getRawExportPath($paths[$i]);
                                }
                            }
                            $configs[0]['data']['paths'][$id] = $paths;
                        }

                        $this->replaceFile(json_encode($configs[0]['data'], JSON_UNESCAPED_SLASHES), $this->getRawExportPath($file));
                    }
                }
                if(isset($configs[1])){
                    $file = $configs[1]['file'];
                    $modulesNode->setAttribute('fallbackConfiguration', $this->getImsPciExportPath($itemRelPath, $file));
                }
            }

            foreach ($portableElement->getRuntimeKey('modules') as $id => $modules) {
                $moduleNode = $dom->createElement($localNs . 'module');
                $moduleNode->setAttribute('id', $id);
                if(isset($modules[0])){
                    $file = $modules[0];
                    $moduleNode->setAttribute('primaryPath', $this->getImsPciExportPath($itemRelPath, $file));
                }
                if(isset($modules[1])){
                    $file = $modules[1];
                    $moduleNode->setAttribute('fallbackPath', $this->getImsPciExportPath($itemRelPath, $file));
                }
                $modulesNode->appendChild($moduleNode);
            }

        }

        unset($xpath);
    }

    private function getImsPciExportPath($itemRelPath, $file){
        return $itemRelPath.$this->portableAssetsToExport[$file];
    }

    private function replaceFile($dataString, $fileToReplace){
        $stream = fopen('php://memory','r+');
        fwrite($stream, $dataString);
        rewind($stream);
        $this->qtiItemExporter->addFile($stream, $fileToReplace);
        fclose($stream);
    }

    private function getItemRelativePath($itemBasePath){
        $returnValue = '';
        $arrDir = explode(DIRECTORY_SEPARATOR, rtrim($itemBasePath, DIRECTORY_SEPARATOR));
        for($i = 0 ; $i < count($arrDir); $i++){
            $returnValue .= '..'.DIRECTORY_SEPARATOR;
        }
        return $returnValue;
    }
}