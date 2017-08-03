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
     * Return runtime files with relative path
     *
     * @return array
     */
    public function getRuntimePath()
    {
        //simply return the assigned runtime configuration data with no change
        return $this->getRuntime();
    }

    /**
     * Return creator files with relative aliases
     *
     * @return array
     */
    public function getRuntimeAliases()
    {
        //simply return the assigned runtime configuration data with no change
        return $this->getRuntime();
    }

    /**
     * Get the registration path for the source within a standard QTI package
     * @param $packagePath - absolute path to the root of the item package
     * @param $itemPath - absolute path to the root of the item folder
     * @return string
     */
    public function getRegistrationPath($packagePath, $itemPath){
        return $packagePath . DIRECTORY_SEPARATOR;
    }

    /**
     * Get the array of key in the portable element model that should not be registered as files
     * @return array
     */
    public function getExcludedKey(){
        return ['waitSeconds'];
    }
}