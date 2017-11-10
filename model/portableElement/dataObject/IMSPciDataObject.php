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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 *
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\qtiItemPci\model\portableElement\dataObject;

class IMSPciDataObject extends PciDataObject
{

    /**
     * Get the registration path of the source within a standard QTI package
     * @param $packagePath - absolute path to the root of the item package
     * @param $itemPath - absolute path to the root of the item folder
     * @return string
     */
    public function getRegistrationSourcePath($packagePath, $itemPath){
        return $packagePath . DIRECTORY_SEPARATOR;
    }

    /**
     * Get the registration file entry
     * @param $file - the relative path to the file
     * @return string
     */
    public function getRegistrationFileId($file){
        //use it as it is without changes
        return $file;
    }

    /**
     * Check the given file entry should be registered or not
     * @param $file
     * @return bool
     */
    public function isRegistrableFile($file){
        //register all files for now
        return true;
    }

    /**
     * Get the array of key in the portable element model that should not be registered as files
     * @return array
     */
    public function getRegistrationExcludedKey(){
        //per standard the waitSeconds is an integer so should not be registered as a file
        return ['waitSeconds'];
    }

    /**
     * Return runtime files with relative path
     *
     * @return array
     */
    public function getRuntimePath()
    {
        $paths = [];

        $runtimeManifest = $this->getRuntime();
        if(isset($runtimeManifest['src'])){
            $paths['src'] = preg_replace('/^' . $this->getTypeIdentifier() . '/', '.', $runtimeManifest['src']);
        }

        $modules = [];
        if(isset($runtimeManifest['modules'])){

            foreach($runtimeManifest['modules'] as $module){
                //merge all module declaration as numeric array
                $modules = array_merge($modules, array_values($module));
            }
        }
        if(isset($runtimeManifest['config'])){
            $configs = [];
            foreach($runtimeManifest['config'] as $config){
                if(isset($config['file'])){
                    $configs[] = $config['file'];
                }
                if(isset($config['data']) && isset($config['data']['paths']) && is_array($config['data']['paths'])){
                    $modules = array_merge($modules, array_values($config['data']['paths']));
                }
            }
            $paths['config'] = $configs;
        }

        $paths['modules'] = $modules;

        return $paths;
    }

    public function getRuntimeAliases()
    {
        $runtimeManifest = $this->getRuntime();
        if(isset($runtimeManifest['src'])) {
            $runtimeManifest['src'] = preg_replace('/^(.\/)?(.*)/', $this->getTypeIdentifier() . "/$2", $runtimeManifest['src']);
        }

        return $runtimeManifest;
    }
}