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

return array(
    'name' => 'qtiItemPci',
    'label' => 'QTI Portable Custom Interaction',
    'description' => '',
    'license' => 'GPL-2.0',
    'version' => '6.1.1',
    'author' => 'Open Assessment Technologies SA',
    'requires' => array(
        'generis' => '>=12.5.0',
        'tao' => '>=30.0.0',
        'taoQtiItem' => '>=13.8.0'
    ),
    'acl' => array(
        array('grant', 'http://www.tao.lu/Ontologies/generis.rdf#qtiItemPciManager', array('ext'=>'qtiItemPci')),
        array('grant', 'http://www.tao.lu/Ontologies/TAOItem.rdf#QTIManagerRole', array('ext'=>'qtiItemPci', 'mod' => 'PciLoader')),
        array('grant', 'http://www.tao.lu/Ontologies/TAOItem.rdf#ItemsManagerRole', array('ext'=>'qtiItemPci', 'mod' => 'PciLoader')),
        array('grant', 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole', array('ext'=>'qtiItemPci', 'mod' => 'PciLoader')),
        array('grant', 'http://www.tao.lu/Ontologies/generis.rdf#qtiItemPciManager', array('ext'=>'qtiItemPci', 'mod' => 'PciManager', 'act' => 'unregister')),
        array('grant', 'http://www.tao.lu/Ontologies/generis.rdf#qtiItemPciManager', array('ext'=>'qtiItemPci', 'mod' => 'PciManager', 'act' => 'enable')),
        array('grant', 'http://www.tao.lu/Ontologies/generis.rdf#qtiItemPciManager', array('ext'=>'qtiItemPci', 'mod' => 'PciManager', 'act' => 'disable')),
        array('grant', 'http://www.tao.lu/Ontologies/generis.rdf#qtiItemPciManager', array('ext'=>'qtiItemPci', 'mod' => 'PciManager', 'act' => 'export')),
        array('grant', 'http://www.tao.lu/Ontologies/generis.rdf#qtiItemPciManager', array('ext'=>'qtiItemPci', 'mod' => 'PciManager', 'act' => 'import')),
        array('grant', 'http://www.tao.lu/Ontologies/generis.rdf#qtiItemPciManager', array('ext'=>'qtiItemPci', 'mod' => 'PciManager', 'act' => 'index')),
    ),
    'install' => array(
        'rdf' => array(
            dirname(__FILE__). '/install/ontology/registry.rdf',
            dirname(__FILE__). '/install/ontology/role.rdf'
        ),
        'php' => array(
            RegisterPciFilesystem::class,
            SetupPortableElementFileStorage::class,
            RegisterPciModel::class,
            RegisterClientProvider::class,
            RegisterPciLiquid::class,
            RegisterPciLikertScale::class,
            RegisterPciMathEntry::class,
            RegisterPciAudioRecording::class,
        )
    ),
    'uninstall' => array(
    ),
    'update' => 'oat\\qtiItemPci\\scripts\\update\\Updater',
    'routes' => array(
        '/qtiItemPci' => 'oat\\qtiItemPci\\controller'
    ),
    'constants' => array(
        # views directory
        "DIR_VIEWS" => dirname(__FILE__).DIRECTORY_SEPARATOR."views".DIRECTORY_SEPARATOR,

        #BASE URL (usually the domain root)
        'BASE_URL' => ROOT_URL.'qtiItemPci/',
    ),
    'extra' => [
        'structures' => __DIR__ . DIRECTORY_SEPARATOR . 'controller' . DIRECTORY_SEPARATOR .'structures.xml'
    ]
);
