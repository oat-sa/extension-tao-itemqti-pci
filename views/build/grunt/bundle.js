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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */

/**
 * Bundle the extension
 * @param {Object} grunt - the grunt objectt (by convention)
 */
module.exports = function (grunt) {
    'use strict';

    grunt.config.merge({
        bundle: {
            qtiitempci: {
                options: {
                    extension: 'qtiItemPci',
                    dependencies: ['taoItems', 'taoQtiItem'],
                    bundles: [
                        {
                            name: 'qtiItemPci',
                            default: true,
                            babel: true
                        }
                    ]
                }
            }
        }
    });

    grunt.registerTask('qtiitempcibundle', ['bundle:qtiitempci']);
};
