/*
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
 * Copyright (c) 201 (original work) Open Assessment Technlogies SA;
 *
 */
define(['lodash'], function (_){
    'use strict';

    var registry = {
        likertScaleInteraction : {
            '0.1.0' : {
                runtimeLocation : 'http://tao.localdomain/qtiItemPci/views/js/pciCreator/dev/likertScaleInteraction',
                hook : 'likertScaleInteraction/runtime/likertScaleInteraction.amd.js',
                libs : [
                    'likertScaleInteraction/runtime/js/renderer'
                ],
                stylesheets : [
                    'likertScaleInteraction/runtime/css/likertScaleInteraction.css'
                ],
                mediaFiles : [
                    'likertScaleInteraction/runtime/assets/ThumbUp.png',
                    'likertScaleInteraction/runtime/assets/ThumbDown.png'
                ]
            }
        }
    };

    function getRuntime(typeIdentifier, version){
        
        if(registry[typeIdentifier]){
            //check version
            if(version){
                return registry[typeIdentifier][version] || null;
            }else{
                //latest
                return _.values(registry[typeIdentifier])[0];
            }
        }
    }
    
    function getRuntimeLocation(typeIdentifier, version){
        var runtime = getRuntime(typeIdentifier, version);
        if(runtime){
            return runtime.runtimeLocation;
        }
        return '';
    }
    
    return {
        getRuntime : getRuntime,
        getRuntimeLocation : getRuntimeLocation
    };
});