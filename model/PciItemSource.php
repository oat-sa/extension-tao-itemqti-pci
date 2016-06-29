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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\qtiItemPci\model;

use oat\oatbox\service\ServiceManager;
use oat\qtiItemPci\model\pci\model\PciModel;
use oat\taoQtiItem\model\qti\Item;

class PciItemSource
{
    /**
     * @var Item
     */
    protected $qtiModel;

    protected $importingFiles = [];
    protected $requiredFiles = [];
    protected $pciModels = [];
    protected $picModels = [];

    protected $source;
    protected $service;

    public function getService()
    {
        if (!$this->service) {
            $this->service = new PortableElementService();
            $this->service->setServiceLocator(ServiceManager::getServiceManager());
        }
        return $this->service;
    }

    /**
     * Handle pci import process for a file
     *
     * @todo
     *
     * @param $absolutePath
     * @param $relativePath
     * @return array
     */
    public function importPortableElementFile($absolutePath, $relativePath)
    {
        if ($this->isPortableElementAsset($relativePath)) {

            //marked the file as being ok to be imported in the end
            $this->importingFiles[] = $relativePath;

            return $this->getFileInfo($absolutePath, $relativePath);
        } else {
            throw new \common_Exception('trying to import an asset that is not part of the portable element asset list');
        }

        // Convert $pciXml to pci model
        // import into registry
        // Alter qti xml to pci xinclude // Asked by Joël
        // Be warning to remove qti file only used by PCI


    }

    /**
     * Check if Item contains portable element
     *
     * @return bool
     */
    public function hasPortableElement()
    {
        return (count($this->requiredFiles) > 0);
    }

    /**
     * Check if file is required by a portable element
     *
     * @param $fileRelativePath
     * @return bool
     */
    public function isPortableElementAsset($fileRelativePath)
    {
        return isset($this->requiredFiles[$fileRelativePath]);
    }

    /**
     * Get details about file
     *
     * @param $path
     * @param $relPath
     * @return array
     * @throws \tao_models_classes_FileNotFoundException
     */
    public function getFileInfo($path, $relPath) {

        if (file_exists($path)) {
            return array(
                'name' => basename($path),
                'uri' => $relPath,
                'mime' => \tao_helpers_File::getMimeType($path),
                'filePath' => $path,
                'size' => filesize($path),
            );
        }

        throw new \tao_models_classes_FileNotFoundException($path);
    }

    /**
     * @return Item
     */
    public function getQtiModel()
    {
        return $this->qtiModel;
    }

    /**
     * @param Item $qtiModel
     */
    public function setQtiModel(Item $item)
    {
        $this->qtiModel = $item;
        $this->feedRequiredFiles($item);
        return $this;
    }

    /**
     * Feed the instance with portable related data extracted from the item
     *
     * @param Item $item
     * @throws \common_Exception
     */
    protected function feedRequiredFiles(Item $item)
    {

        $this->requiredFiles = [];
        $this->pciModels = [];
        $this->picModels = [];

        //same for the PICs
        $pcis = $item->getComposingElements('oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction');

        foreach($pcis as $pci) {
//            $version = $pci->getVersion();
//            $stylesheets = $pci->getStylesheets();
//            $mediaFiles = $pci->getMediaFiles();
            $version = '1.0';
            $stylesheets = [];
            $mediaFiles = [];
            $typeId = $pci->getTypeIdentifier();
            $runtime = [
                'hook' => $pci->getEntryPoint(),
                'libraries' => $pci->getLibraries(),
                'stylesheets' => $stylesheets,
                'mediaFiles' => $mediaFiles
            ];
            $pciModel = new PciModel($typeId, $version);
            $pciModel->exchangeArray([
                'label' => $typeId,
                'short' => $typeId,
                'runtime' => $runtime
            ]);

            $lastVersionModel = $this->getService()->getLatestPciByIdentifier($pciModel->getTypeIdentifier());
            if (!is_null($lastVersionModel)
                && (intval($lastVersionModel->getVersion()) != intVal($pciModel->getVersion()))
            ) {
                //@todo return a user exception to inform user of incompaible pci version found and that an item update is required
                throw new \common_Exception('Unable to import pci asset because pci is not compatible. '
                    . 'Current version is ' . $lastVersionModel->getVersion() . ' and imported is ' . $pciModel->getVersion());
            }

            $this->pciModels[$typeId] = $pciModel;

            $requiredLibs = [];
            foreach($runtime['libraries'] as $lib){
                if(preg_match('/^'.$typeId.'/', $lib)){//filter shared stimulus
                    $requiredLibs[] = $lib.'.js';//amd modules
                }
            }

            $files = array_merge([$runtime['hook']], $requiredLibs, $runtime['stylesheets'], $runtime['mediaFiles']);
            $this->requiredFiles = array_merge($this->requiredFiles, array_fill_keys($files, $typeId));
        }
    }

    public function setSource($source)
    {
        $this->source = $source;
        return $this;
    }
    /**
     * Do the import of portable elements
     */
    public function importPortableElements()
    {
        if (count($this->importingFiles) != count($this->requiredFiles)) {
            throw new \common_Exception();
        }

        foreach ($this->pciModels as $model) {
            $lastVersionModel = $this->getService()->getLatestPciByIdentifier($model->getTypeIdentifier());
            //only register a pci that has not been register yet, subsequent update must be done through pci package import
            if(is_null($lastVersionModel)){
                $this->getService()->registerModel($model, $this->source);
            }
        }
        return true;
    }

}