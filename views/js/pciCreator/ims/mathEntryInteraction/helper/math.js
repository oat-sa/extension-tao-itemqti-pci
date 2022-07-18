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
define(['mathJax'], function (MathJax) {
    'use strict';

    // Do not wait between rendering each individual math element
    // http://docs.mathjax.org/en/latest/api/hub.html
    // https://github.com/oat-sa/tao-item-runner-qti-fe/blob/master/src/qtiCommonRenderer/renderers/Math.js
    if (typeof MathJax !== 'undefined' && MathJax) {
        MathJax.Hub.processSectionDelay = 0;
    }

    const mathRenderer = {
        /**
         * On dom element containing `<math>...</math>` MathML markup,
         * run MathJax renderer ("typeset" it)
         * @see https://github.com/oat-sa/tao-item-runner-qti-fe/blob/master/src/qtiCommonRenderer/renderers/Math.js
         * @param {Object} $element
         */
        postRender: function postRender($element) {
            if (typeof MathJax !== 'undefined' && MathJax) {
                if (!window.MathJax) {
                    window.MathJax = MathJax;
                }
                if ($element.length) {
                    MathJax.Hub.Queue(['Typeset', MathJax.Hub, $element[0]]);
                }
            }
        }
    };

    return mathRenderer;
});
