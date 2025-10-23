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
define([
    'mathEntryInteraction/runtime/mathml-to-latex/mathml-to-latex',
    'mathEntryInteraction/runtime/mathquill/mathquill'
], function (Mathml2latex, MathQuill) {
    'use strict';

    const MQ = MathQuill.getInterface(2);

    // MathML-to-LaTeX may be nested and needs to be unpacked
    if (Mathml2latex.MathMLToLaTeX) {
        Mathml2latex = Mathml2latex.MathMLToLaTeX;
    }

    /**
     * Extract LaTeX content from a Math expression.
     * @param {HTMLElement} element
     * @returns {string|any}
     */
    function getLaTeX(element) {
        const annotation = element.querySelector('annotation');
        if (annotation) {
            return annotation.innerHTML;
        }
        return Mathml2latex.convert(element.outerHTML);
    }

    const mathInPrompt = {
        /**
         * On dom element containing `<math>...</math>` MathML markup, apply a Math renderer
         * @param {jQuery} $element
         */
        postRender($element) {
            if (window.MathJax){
                // prevent MathJax prompt rewriting
                return;
            }
            $element.find('math').each(function () {
                const math = document.createElement('span');
                math.innerHTML = getLaTeX(this);
                this.replaceWith(math);
                MQ.StaticMath(math);
            });
        }
    };

    return mathInPrompt;
});
