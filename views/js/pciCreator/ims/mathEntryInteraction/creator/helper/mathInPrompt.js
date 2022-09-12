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
define(['core/moduleLoader', 'mathEntryInteraction/runtime/mathml-to-latex/mathml-to-latex'], function (moduleLoader, Mathml2latex) {
    'use strict';

    let MathJax;
    let loaded = false;

    /***
     * lazy-load MathJax dependency
     * @returns {Promise}
     */
    function load() {
        if (loaded) {
            return Promise.resolve();
        }
        return moduleLoader([], () => true)
            .add({ module: 'mathJax', category: 'mathEntryInteraction' })
            .load()
            .then(loadedModule => {
                loaded = true;
                MathJax = loadedModule && loadedModule.length ? loadedModule[0] : void 0;

                /**
                 * Do not wait between rendering each individual math element
                 * http://docs.mathjax.org/en/latest/api/hub.html
                 * @see https://github.com/oat-sa/tao-item-runner-qti-fe/blob/master/src/qtiCommonRenderer/renderers/Math.js
                 */
                if (MathJax && MathJax.Hub) {
                    MathJax.Hub.processSectionDelay = 0;
                }
            });
    }

    const mathInPrompt = {
        /**
         * On dom element containing `<math>...</math>` MathML markup,
         * run MathJax renderer ("typeset" it)
         * @param {Object} $element
         * @returns {Promise}
         */
        postRender: function postRender($element) {
            $element.find('math').each(function() {
                console.log('converting:', this.innerHTML, 'to:', Mathml2latex.convert(this.outerHTML));
            });

            if ($element.find('math').length === 0) {
                return Promise.resolve();
            }
            return load().then(() => {
                if (MathJax && MathJax.Hub && typeof MathJax.Hub.Queue === 'function') {
                    /**
                     * MathJax needs to be exported globally to integrate with tools like TTS, it's weird...
                     * @see https://github.com/oat-sa/tao-item-runner-qti-fe/blob/master/src/qtiCommonRenderer/renderers/Math.js
                     */
                    if (!window.MathJax) {
                        window.MathJax = MathJax;
                    }
                    if ($element.length) {
                        MathJax.Hub.Queue(['Typeset', MathJax.Hub, $element[0]]);
                    }
                }
            });
        }
    };

    return mathInPrompt;
});
