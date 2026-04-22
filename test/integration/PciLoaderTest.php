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
 * Foundation, Inc., 31 Milk Street, # 960789, Boston, MA 02196, USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\qtiItemPci\test\integration;

use oat\generis\test\MockObject;
use oat\generis\test\TestCase;
use oat\oatbox\service\ServiceManager;
use oat\qtiItemPci\controller\PciLoader;
use oat\qtiItemPci\model\portableElement\storage\PciRegistry;
use oat\taoQtiItem\model\portableElement\exception\PortableElementException;

class PciLoaderTest extends TestCase
{
    /**
     * @var MockObject
     */
    private $pciRegistryMock;

    /**
     * @var MockObject
     */
    private $imsRegistryMock;

    /**
     * @var ServiceManager
     */
    private $previousServiceManager;

    /**
     * @throws \common_ext_ExtensionException
     */
    public function setUp(): void
    {
        $this->previousServiceManager = ServiceManager::getServiceManager();

        // Test data for TAO PCI
        $pciTestData = [
            'likertScaleInteraction' => [
                [
                    'model' => 'PCI',
                    'typeIdentifier' => 'likertScaleInteraction',
                    "version" => "1.2.0",
                    'runtime' => [
                        'hook' => 'dist/likertScale/runtime/likertScale.min.js',
                        'modules' => [
                            'likertScale' => ['dist/likertScale/runtime/likertScale.min.js']
                        ],
                    ],
                    'creator' => [
                        'hook' => 'dist/likertScale/creator/likertScale.min.js',
                        'modules' => ['dist/likertScale/creator/likertScale.min.js'],
                        'icon' => 'dist/likertScale/creator/img/icon.png'
                    ]
                ]
            ]
        ];

        // Test data for IMS PCI
        $imsTestData = [
            'entryCodeInteraction' => [
                [
                    'model' => 'IMSPCI',
                    'typeIdentifier' => 'entryCodeInteraction',
                    'version' => '1.2.0',
                    'runtime' => [
                        'hook' => '\/\/runtime\/entryCode.min.js',
                        'modules' => [
                            'entryCodeInteraction\/runtime\/entryCode.min' => [
                                'runtime\/entryCode.min.js'
                            ]
                        ]
                    ],
                    'creator' => [
                        'icon' => 'entryCodeInteraction\/icon.svg',
                        'hook' => 'entryCodeInteraction\/imsPciCreator.min.js',
                        'src' => [
                            'entryCodeInteraction\/imsPciCreator.js'
                        ]
                    ]
                ]
            ]
        ];

        $this->pciRegistryMock = $this->createMock(PciRegistry::class);
        $this->pciRegistryMock
            ->method('getLatestRuntimes')
            ->willReturn($pciTestData);

        $this->imsRegistryMock = $this->createMock(PciRegistry::class);
        $this->imsRegistryMock
            ->method('getLatestRuntimes')
            ->willReturn($imsTestData);

        $extensionMock = $this->createMock(\common_ext_Extension::class);
        $extensionMock
            ->method('getConfig')
            ->with('debug_portable_element')
            ->willReturn(null);

        $extensionsManagerMock = $this->createMock(\common_ext_ExtensionsManager::class);
        $extensionsManagerMock
            ->method('getExtensionById')
            ->with('taoQtiItem')
            ->willReturn($extensionMock);

        ServiceManager::setServiceManager($this->traitGetServiceManagerMock([
            \common_ext_ExtensionsManager::class => $extensionsManagerMock,
        ]));
    }

    protected function tearDown(): void
    {
        ServiceManager::setServiceManager($this->previousServiceManager);
        parent::tearDown();
    }

    /**
     * Note: the inner logic modifying the PCI structures when debug_portable_element is set is not tested.
     */
    public function testLoad()
    {
        $registries = [$this->pciRegistryMock, $this->imsRegistryMock];
        $pciLoader = new PciLoaderForTest($registries);
        $pciLoader->load();

        $response = $pciLoader->getLastJsonResponse();
        $statusCode = $pciLoader->getLastJsonStatusCode();

        $this->assertIsArray($response);
        $this->assertArrayHasKey('likertScaleInteraction', $response);
        $this->assertArrayHasKey('entryCodeInteraction', $response);

        $this->assertArrayHasKey('runtime', $response['likertScaleInteraction'][0]);
        $this->assertArrayHasKey('creator', $response['likertScaleInteraction'][0]);
        $this->assertArrayHasKey('runtime', $response['entryCodeInteraction'][0]);
        $this->assertArrayHasKey('creator', $response['entryCodeInteraction'][0]);

        $this->assertEquals(200, $statusCode);
    }

    public function testLoadError()
    {
        $exceptionMessage = 'Upstream registry failure';
        $failingRegistry = $this->createMock(PciRegistry::class);
        $failingRegistry
            ->method('getLatestRuntimes')
            ->willThrowException(new PortableElementException($exceptionMessage));

        $pciLoader = new PciLoaderForTest([$failingRegistry]);
        $pciLoader->load();

        $this->assertEquals($exceptionMessage, $pciLoader->getLastJsonResponse());
        $this->assertEquals(500, $pciLoader->getLastJsonStatusCode());
    }

    public function testGetLatestPciRuntimes()
    {
        $registries = [$this->pciRegistryMock, $this->imsRegistryMock];
        $pciLoader = new PciLoaderForTest($registries);
        $result = $pciLoader->getLatestPciRuntimes();

        $this->assertIsArray($result);
        $this->assertArrayHasKey('likertScaleInteraction', $result);
        $this->assertArrayHasKey('entryCodeInteraction', $result);

        $response = $pciLoader->getLastJsonResponse();
        $statusCode = $pciLoader->getLastJsonStatusCode();

        $this->assertEquals(null, $response);
        $this->assertEquals(null, $statusCode);
    }
}

class PciLoaderForTest extends PciLoader
{
    /**
     * @var array
     */
    private $registries;

    /**
     * @var array|null
     */
    private $lastJsonResponse;

    /**
     * @var int|null
     */
    private $lastJsonStatusCode;

    public function __construct(array $registries = [])
    {
        parent::__construct();
        $this->registries = $registries;
        $this->lastJsonResponse = null;
        $this->lastJsonStatusCode = null;
    }

    protected function getRegistries()
    {
        return $this->registries ?: parent::getRegistries();
    }

    public function returnJson($response, $statusCode = 200)
    {
        $this->lastJsonResponse = $response;
        $this->lastJsonStatusCode = $statusCode;
    }

    public function getLastJsonResponse()
    {
        return $this->lastJsonResponse;
    }

    public function getLastJsonStatusCode()
    {
        return $this->lastJsonStatusCode;
    }
}
