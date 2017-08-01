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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
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
        $paths = [];
        foreach ($this->getRuntime() as $key => $value) {
            if (in_array($key, ['hook', 'libraries', 'stylesheets', 'mediaFiles', 'icon'])) {
                $paths[$key] = preg_replace('/^(.\/)(.*)/', $this->getTypeIdentifier() . "/$2", $this->getRuntimeKey($key));
            }
        }
        return $paths;
    }
}