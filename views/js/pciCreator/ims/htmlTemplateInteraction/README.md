# HTML Template Interaction

This PCI is a kind of blank canvas - it will render whatever HTML string you pass into it as a property. It even renders styles and images, as long as they too are inlined in that single HTML string. This gives the item author an unprecedented level of control over the look and feel of the interactions they can create, as long as their interactivity needs can be satisfied by basic HTML input elements. The PCI will not however execute user-provided Javascript.

## Properties

- `html` (string) Can be a full HTML document or just some body contents
- The PCI creator also supports a rich-text prompt, which is authored separately from its `html` property

## Special HTML attributes

- `data-response` **mandatory** - add this valueless attribute to each input element intended to be captured in the response
- `name` **mandatory** - name attribute to act as the identifier of each `data-response` element. Names must be unique (_execption: radio groups, where the name should be common and the values unique_).
- `data-wordcount-for` - add this attribute to an empty element where the wordcount of a textarea or text input should be displayed (optional)

Examples:

```html
<textarea name="text1" data-response></textarea>
<p data-wordcount-for="text1"></p>

<input type="text" name="text2" size="20" data-response>
<span data-wordcount-for="text2"></span>
```

## Supported response elements

Any combination of the following example elements can be used in templates:

- `<textarea name="text1" data-response></textarea>`
- `<input type="text" name="text2" data-response>`
- `<input type="number" name="text3" data-response>`
- `<input type="radio" name="radiogroup1" value="value1" data-response>`
- `<input type="checkbox" name="checkbox1" data-response>`
- `<select name="select1" data-response>...</select>`

This allows several standard QTI interactions to be easily mimicked or remixed: ExtendedText, TextEntry, Choice, InlineChoice, Match, Hottext, Hotspot.

## Item development

Creation of the content for the PCI can be done by anyone with knowledge of HTML and CSS:

1. First, build up an HTML template until it looks how you want it in a browser. It's recommended to use a code editor which will be able to help with features like completion, HTML validation, accessibility hints, live preview, or even integrations like ChatGPT.
2. Second, (assuming the HTML template references external assets), use the provided CLI script to convert the template into a self-contained HTML string.
3. Third, create a new item in TAO, author it, drag this PCI onto the item canvas, and copy-paste the entire HTML string into the property field.
4. The item can then be saved and previewed, placed into a test, and published.

### Writing templates

Some example templates are located in `templates`. Most of them use very simple HTML, a background image, and absolute positioning (as it is one of the most bulletproof ways to lay out content over an image). But since the HTML template is fully under the item author's control, authors are free to experiment with whatever layout structures they prefer.

```
templates/
  01/
    _textarea-wordcount.txt   // empty file with descriptive filename
    index.html                // entrypoint
    style.css                 // linked stylesheet (optional)
    bg.png                    // linked image (optional)
```

To work on a new template, duplicate one of the existing template folders or create one from scratch with any name.

### Using the CLI script

A Node script exists for converting the static HTML templates with linked assets into the self-contained string format needed for the PCI's `html` property.

> Prerequisite: NodeJS >=18

Enter its folder:

```sh
cd cli
```

Run the script, giving the path to your template entrypoint:

```sh
node inliner.cjs ../templates/00/index.html
```

The output is written to `index_inlined.html` in the same folder as `index.html`. The content of this file is ready to be copy-pasted to the PCI item being authored.

## Response format

The PCI submits its response in QTI [record](https://www.imsglobal.org/node/163496#baseTypes) cardinality. For the subrecords in the `record` (there can be as many entries as you have response elements), only single (`base`) cardinality is supported for now (not `list` or `ordered`).

Response example from a template containing various input element types:

```json
{
  "record": [
    {
      "name": "textarea1",
      "base": {
        "string": "this is my long-form response"
      }
    },
    {
      "name": "input1",
      "base": {
        "string": "text typed in a text input"
      }
    },
    {
      "name": "select1",
      "base": {
        "identifier": "option1"
      }
    },
    {
      "name": "checkbox1",
      "base": {
        "boolean": true
      }
    },
    {
      "name": "radiogroup1",
      "base": {
        "identifier": "radiogroup1_value1"
      }
    },
    {
      "name": "unfilled",
      "base": null
    }
  ]
}
```

Note that response processing is also not implemented yet, so correct responses cannot be defined and the interaction cannot be automatically scored.
