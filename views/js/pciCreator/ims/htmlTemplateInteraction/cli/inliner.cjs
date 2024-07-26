#!/usr/bin/env node
/**
 * Script to convert a static HTML document (including linked styles/images)
 * into a single-line string with all its assets inlined.
 * @usage node inliner.cjs ../templates/01/index.html
 * @output ../templates/01/index_inlined.html
 */

const path = require('node:path');
const fs = require('node:fs');
const Inliner = require('inliner');

const argv = process.argv.slice(2);
const pathToFile = path.resolve(__dirname, argv[0]);
const dirOfFile = path.dirname(pathToFile);
const baseOfFile = path.basename(pathToFile);
const extOfFile = path.extname(pathToFile);
const outputFilename = baseOfFile.replace(extOfFile, `_inlined${extOfFile}`);

const target = 'html'; // modify for json-compatible output

new Inliner(pathToFile, {}, (error, html) => {
    if (error) throw error;
    const htmlString = html; // good for copy-paste to TAO Authoring
    const jsonString = JSON.stringify(html); // good for copy-paste to JSON file
    fs.writeFileSync(path.join(dirOfFile, outputFilename), target === 'json' ? jsonString : htmlString);
});
