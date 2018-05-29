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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\qtiItemPci\model;

use oat\oatbox\service\ConfigurableService;

class PciLoaderService extends ConfigurableService
{
    const SERVICE_ID = 'qtiItemPci/PciLoaderService';

    /**
     * @return mixed
     */
    public function load()
    {
        $customInteractionDirs = $this->getServiceLocator()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoQtiItem')->getConfig('debug_portable_element');

        $data = array_reduce($this->getRegistries(), function($acc, $registry) use ($customInteractionDirs){
            $latestRuntimes = $registry->getLatestRuntimes();
            if(is_array($customInteractionDirs)){
                foreach($latestRuntimes as $id => &$versions){
                    if(isset($customInteractionDirs[$id])){
                        //add option to load from source (as opposed to from the default min.js files)
                        foreach($versions as &$version){
                            // IMS PCI
                            if (isset($version['model']) && $version['model'] == 'IMSPCI') {
                                $modules = (isset($version['runtime']) && isset($version['runtime']['modules'])) ? $version['runtime']['modules'] : [];
                                $src = (isset($version['runtime']) && isset($version['runtime']['src'])) ? $version['runtime']['src'] : [];

                                // in case of a TAO bundled PCI (= we have a "src" entry),
                                // we redirect the module to the entry point of the PCI instead of its minified version
                                if (count($src) > 0) {
                                    foreach($modules as $moduleKey => &$allModulesFiles) {
                                        if (strpos($moduleKey, '.min') == (strlen($moduleKey) - strlen('.min'))) {
                                            foreach($allModulesFiles as &$moduleFile) {
                                                $moduleFile = str_replace('.min.js', '.js', $moduleFile);
                                            }
                                        }
                                    }
                                }

                                if (isset($version['runtime']) && isset($version['runtime']['modules'])) {
                                    $version['runtime']['modules'] = $modules;
                                }
                                if(isset($version['creator']) && isset($version['creator']['src'])){
                                    //the first entry of the src array is always the entrypoint (PCI hook)
                                    $version['creator']['hook'] = array_shift($version['creator']['src']);
                                    $version['creator']['modules'] = $version['creator']['src'];
                                    unset($version['creator']['src']);
                                }

                                // TAO PCI
                            } else {
                                if(isset($version['runtime']) && isset($version['runtime']['src'])){
                                    $version['runtime']['libraries'] = $version['runtime']['src'];
                                    unset($version['runtime']['hook']);
                                    unset($version['runtime']['src']);
                                }
                                if(isset($version['creator']) && isset($version['creator']['src'])){
                                    //the first entry of the src array is always the entrypoint (PCI hook)
                                    $version['creator']['hook'] = array_shift($version['creator']['src']);
                                    $version['creator']['modules'] = $version['creator']['src'];
                                    unset($version['creator']['src']);
                                }
                            }
                        }
                    }
                }
            }
            return array_merge($acc, $latestRuntimes);
        }, []);

        return $data;
    }

    protected function getRegistries()
    {
        return [(new PciModel())->getRegistry(), (new IMSPciModel())->getRegistry()];
    }
}