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
 * Copyright (c) 2016-2024 (original work) Open Assessment Technologies SA;
 *
 */
define(['likertScaleInteraction/runtime/js/assets'], function(assets) {
    'use strict';

    function renderChoices(id, container, config) {
        const level = parseInt(config.level) || 5;
        const rootElt = container.querySelector('.likertInteraction');
        const ol = rootElt.querySelector('ol.likert');

        rootElt.classList.toggle('numbers-above', config['numbers']);

        //ensure that renderChoices() is idempotent
        ol.replaceChildren();

        // add levels
        for (let i = 1; i <= level; i++) {
            const li = document.createElement('li');
            const input = document.createElement('input');
            input.setAttribute('type', 'radio');
            input.setAttribute('name', id);
            input.setAttribute('value', i);

            li.appendChild(input);
            ol.appendChild(li);
        }
    }

    function renderLabels(container, config) {
        const row = container.querySelector('.row');
        const ol = row.querySelector('ol.likert');

        // texts
        const labelMin = document.createElement('span');
        labelMin.classList.add('likert-label', 'likert-label-min');
        labelMin.innerHTML = config['label-min'];

        const labelMax = document.createElement('span');
        labelMax.classList.add('likert-label', 'likert-label-max');
        labelMax.innerHTML = config['label-max'];

        // icons
        const parseSvgString = svgString => new DOMParser().parseFromString(svgString, 'image/svg+xml').querySelector('svg');
        const iconMin = parseSvgString(assets.thumbDown);
        const iconMax = parseSvgString(assets.thumbUp);

        if (config.icons) {
            row.replaceChildren(labelMin, iconMin, ol, iconMax, labelMax);
        } else {
            row.replaceChildren(labelMin, ol, labelMax);
        }
    }

    return {
        render(id, container, config) {
            renderChoices(id, container, config);
            renderLabels(container, config);
        },
        renderChoices,
        renderLabels
    };
});
