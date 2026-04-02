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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

/**
 * Unit tests for qtiItemPci/pciProvider module
 * Tests the configuration fallback logic for _pciLoadUrl
 *
 * The module under test (lines 21-22 of pciProvider.js):
 *   const config = module.config();
 *   let _pciLoadUrl = config.serverUrl || helpers._url('load', 'PciLoader', 'qtiItemPci');
 */
define(['jquery', 'helpers'], function($, helpers) {
    'use strict';

    var expectedFallbackUrl = helpers._url('load', 'PciLoader', 'qtiItemPci');
    var originalAjax = $.ajax;
    var pciProviderModuleId = 'qtiItemPci/pciProvider';

    /**
     * Helper to restore the pciProvider module to its original/default state.
     * This resets the RequireJS config and undefines the module so it can be
     * reloaded fresh with default config in subsequent tests.
     */
    function restorePciProviderModule() {
        // Reset the module config to empty (default state)
        require.config({
            config: {
                'qtiItemPci/pciProvider': {}
            }
        });
        // Undefine the module so next require() will reload it with fresh config
        require.undef(pciProviderModuleId);
    }

    QUnit.module('pciProvider - _pciLoadUrl configuration fallback', {
        afterEach: function() {
            $.ajax = originalAjax;
            restorePciProviderModule();
        }
    });

    /**
     * Test 1: Verify fallback to helpers._url when no serverUrl is configured
     *
     * This tests the fallback branch of:
     *   let _pciLoadUrl = config.serverUrl || helpers._url('load', 'PciLoader', 'qtiItemPci');
     *
     * When module.config() returns empty/no serverUrl, the || operator falls back
     * to helpers._url('load', 'PciLoader', 'qtiItemPci')
     */
    QUnit.test('falls back to helpers._url when serverUrl is not configured (default behavior)', function(assert) {
        var ready = assert.async();
        var capturedUrl = null;

        // The module should already be loaded with default config (no serverUrl)
        // which means it uses the helpers._url fallback
        require(['qtiItemPci/pciProvider'], function(pciProvider) {
            // Mock $.ajax to capture the URL being used
            $.ajax = function(options) {
                capturedUrl = options.url;
                var deferred = $.Deferred();
                deferred.resolve([]);
                return deferred.promise();
            };

            pciProvider.load().then(function() {
                // Verify the URL matches what helpers._url returns
                assert.ok(capturedUrl, 'load() made an AJAX request');
                assert.equal(
                    capturedUrl,
                    expectedFallbackUrl,
                    '_pciLoadUrl equals helpers._url("load", "PciLoader", "qtiItemPci") when serverUrl not configured'
                );
                $.ajax = originalAjax;
                ready();
            }).catch(function(err) {
                assert.ok(false, 'load() failed: ' + err);
                $.ajax = originalAjax;
                ready();
            });
        }, function(err) {
            assert.ok(false, 'Failed to load pciProvider: ' + err);
            ready();
        });
    });

    /**
     * Test 2: Verify that when serverUrl IS configured, it takes precedence
     *
     * This tests the primary branch of:
     *   let _pciLoadUrl = config.serverUrl || helpers._url('load', 'PciLoader', 'qtiItemPci');
     *
     * When module.config().serverUrl is truthy, it is used directly.
     *
     * Note: This test requires the module to be reloaded with new config.
     * We set up a fresh config and reload the module.
     */
    QUnit.test('uses serverUrl from module.config() when provided', function(assert) {
        var ready = assert.async();
        var customServerUrl = 'http://custom.server/pci/load';
        var capturedUrl = null;

        // Undefine the module so it can be reloaded with new config
        require.undef('qtiItemPci/pciProvider');

        // Configure the module with a custom serverUrl
        require.config({
            config: {
                'qtiItemPci/pciProvider': {
                    serverUrl: customServerUrl
                }
            }
        });

        // Load the module fresh - it will now read the new config
        require(['qtiItemPci/pciProvider'], function(pciProvider) {
            // Mock $.ajax to capture the URL being used
            $.ajax = function(options) {
                capturedUrl = options.url;
                var deferred = $.Deferred();
                deferred.resolve([]);
                return deferred.promise();
            };

            pciProvider.load().then(function() {
                // Verify the URL matches our custom serverUrl
                assert.ok(capturedUrl, 'load() made an AJAX request');
                assert.equal(
                    capturedUrl,
                    customServerUrl,
                    '_pciLoadUrl equals serverUrl from module.config() when provided'
                );
                $.ajax = originalAjax;
                ready();
            }).catch(function(err) {
                assert.ok(false, 'load() failed: ' + err);
                $.ajax = originalAjax;
                ready();
            });
        }, function(err) {
            assert.ok(false, 'Failed to load pciProvider: ' + err);
            ready();
        });
    });

    QUnit.module('pciProvider - API', {
        afterEach: function() {
            $.ajax = originalAjax;
            restorePciProviderModule();
        }
    });

    QUnit.test('module structure', function(assert) {
        var ready = assert.async();

        require(['qtiItemPci/pciProvider'], function(pciProvider) {
            assert.ok(pciProvider, 'pciProvider module loaded');
            assert.equal(typeof pciProvider, 'object', 'pciProvider is an object');
            assert.equal(typeof pciProvider.load, 'function', 'pciProvider.load is a function');
            ready();
        }, function(err) {
            assert.ok(false, 'Failed to load pciProvider: ' + err);
            ready();
        });
    });

    QUnit.test('load returns a Promise', function(assert) {
        var ready = assert.async();

        require(['qtiItemPci/pciProvider'], function(pciProvider) {
            $.ajax = function() {
                var deferred = $.Deferred();
                deferred.resolve([]);
                return deferred.promise();
            };

            var loadResult = pciProvider.load();

            assert.ok(loadResult, 'load() returns something');
            assert.equal(typeof loadResult.then, 'function', 'load() returns a thenable (Promise)');

            loadResult.then(function() {
                $.ajax = originalAjax;
                ready();
            }).catch(function() {
                $.ajax = originalAjax;
                ready();
            });
        }, function(err) {
            assert.ok(false, 'Failed to load pciProvider: ' + err);
            ready();
        });
    });
});
