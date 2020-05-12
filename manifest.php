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
 *
 */

use oat\qtiItemPci\scripts\install\RegisterClientProvider;
use oat\qtiItemPci\scripts\install\RegisterPciAudioRecording;
use oat\qtiItemPci\scripts\install\RegisterPciLiquid;
use oat\qtiItemPci\scripts\install\RegisterPciLikertScale;
use oat\qtiItemPci\scripts\install\RegisterPciMathEntry;
use oat\qtiItemPci\scripts\install\RegisterPciModel;
use oat\qtiItemPci\scripts\install\RegisterPciFilesystem;
use oat\taoQtiItem\scripts\SetupPortableElementFileStorage;

return [
    'name' => 'qtiItemPci',
    'label' => 'QTI Portable Custom Interaction',
    'description' => '',
    'license' => 'GPL-2.0',
    'version' => '6.6.0',
    'author' => 'Open Assessment Technologies SA',
    'requires' => [
        'generis' => '>=12.15.0',
        'tao' => '>=30.0.0',
        'taoQtiItem' => '>=13.8.0'
    ],
    'acl' => [
        ['grant', 'http://www.tao.lu/Ontologies/generis.rdf#qtiItemPciManager', ['ext' => 'qtiItemPci']],
        ['grant', 'http://www.tao.lu/Ontologies/TAOItem.rdf#QTIManagerRole', ['ext' => 'qtiItemPci', 'mod' => 'PciLoader']],
        ['grant', 'http://www.tao.lu/Ontologies/TAOItem.rdf#ItemsManagerRole', ['ext' => 'qtiItemPci', 'mod' => 'PciLoader']],
        ['grant', 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole', ['ext' => 'qtiItemPci', 'mod' => 'PciLoader']],
        ['grant', 'http://www.tao.lu/Ontologies/generis.rdf#qtiItemPciManager', ['ext' => 'qtiItemPci', 'mod' => 'PciManager', 'act' => 'unregister']],
        ['grant', 'http://www.tao.lu/Ontologies/generis.rdf#qtiItemPciManager', ['ext' => 'qtiItemPci', 'mod' => 'PciManager', 'act' => 'enable']],
        ['grant', 'http://www.tao.lu/Ontologies/generis.rdf#qtiItemPciManager', ['ext' => 'qtiItemPci', 'mod' => 'PciManager', 'act' => 'disable']],
        ['grant', 'http://www.tao.lu/Ontologies/generis.rdf#qtiItemPciManager', ['ext' => 'qtiItemPci', 'mod' => 'PciManager', 'act' => 'export']],
        ['grant', 'http://www.tao.lu/Ontologies/generis.rdf#qtiItemPciManager', ['ext' => 'qtiItemPci', 'mod' => 'PciManager', 'act' => 'import']],
        ['grant', 'http://www.tao.lu/Ontologies/generis.rdf#qtiItemPciManager', ['ext' => 'qtiItemPci', 'mod' => 'PciManager', 'act' => 'index']],
    ],
    'install' => [
        'rdf' => [
            __DIR__ . '/install/ontology/registry.rdf',
            __DIR__ . '/install/ontology/role.rdf'
        ],
        'php' => [
            RegisterPciFilesystem::class,
            SetupPortableElementFileStorage::class,
            RegisterPciModel::class,
            RegisterClientProvider::class,
            RegisterPciLiquid::class,
            RegisterPciLikertScale::class,
            RegisterPciMathEntry::class,
            RegisterPciAudioRecording::class,
        ]
    ],
    'uninstall' => [
    ],
    'update' => 'oat\\qtiItemPci\\scripts\\update\\Updater',
    'routes' => [
        '/qtiItemPci' => 'oat\\qtiItemPci\\controller'
    ],
    'constants' => [
        # views directory
        "DIR_VIEWS" => __DIR__ . DIRECTORY_SEPARATOR . "views" . DIRECTORY_SEPARATOR,

        #BASE URL (usually the domain root)
        'BASE_URL' => ROOT_URL . 'qtiItemPci/',
    ],
    'extra' => [
        'structures' => __DIR__ . DIRECTORY_SEPARATOR . 'controller' . DIRECTORY_SEPARATOR . 'structures.xml'
    ]
];
