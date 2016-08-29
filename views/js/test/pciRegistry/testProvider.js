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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */
define(['context'], function (context){
    'use strict';

    var _registry0 = {
        likertScaleInteraction : [
            {
                'baseUrl' : context.root_url+'qtiItemPci/views/js/pciCreator/dev/likertScaleInteraction',
                'typeIdentifier' : 'likertScaleInteraction',
                'label' : 'Likert Scale',
                'short' : 'Likert',
                'description' : 'A simple implementation of likert scale.',
                'version' : '1.1.0',
                'author' : 'Sam Sipasseuth',
                'email' : 'sam@taotesting.com',
                'tags' : [
                    'mcq',
                    'likert'
                ],
                'response' : {
                    'baseType' : 'integer',
                    'cardinality' : 'single'
                },
                'runtime' : {
                    'hook' : 'likertScaleInteraction/runtime/likertScaleInteraction.amd.js',
                    'libraries' : [
                        'IMSGlobal/jquery_2_1_1',
                        'likertScaleInteraction/runtime/js/renderer.js'
                    ],
                    'stylesheets' : [
                        'likertScaleInteraction/runtime/css/base.css',
                        'likertScaleInteraction/runtime/css/likertScaleInteraction.css'
                    ],
                    'mediaFiles' : [
                        'likertScaleInteraction/runtime/assets/ThumbDown.png',
                        'likertScaleInteraction/runtime/assets/ThumbUp.png',
                        'likertScaleInteraction/runtime/css/img/bg.png'
                    ]
                },
                'creator' : {
                    'icon' : 'likertScaleInteraction/creator/img/icon.svg',
                    'hook' : 'likertScaleInteraction/pciCreator.js',
                    'libraries' : [
                        'likertScaleInteraction/creator/tpl/markup.tpl',
                        'likertScaleInteraction/creator/tpl/propertiesForm.tpl',
                        'likertScaleInteraction/creator/widget/Widget.js',
                        'likertScaleInteraction/creator/widget/states/Question.js',
                        'likertScaleInteraction/creator/widget/states/states.js'
                    ]
                }
            }
        ]
    };

    return {
        load : function load(){
            return _registry0;
        }
    };
});