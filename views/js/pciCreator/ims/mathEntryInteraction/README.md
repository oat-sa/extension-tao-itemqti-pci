# MathEntry PCI

PCI for rendering Maths expressions.

## Development

The PCI embeds MathQuill for rendering Maths expressions.

However, this library ony support LaTeX, and other formats need to be converted. For this purpose, the PCI also includes [`mathml-to-latex`](https://github.com/qtikit/mathml-to-latex), which is installed via `npm`.

To update the lib, please do:
- update the version in the nested `package.json` file
- update the installed version by running `npm i`
- update the bundled copy by running `npm run build`
- commit the modifications
