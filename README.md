![Tests](https://github.com/vibbits/phyd3-parser-compat/actions/workflows/test.yml/badge.svg)
![NPM](https://img.shields.io/npm/v/@vibbioinfocore/phyd3-parser-compat)

# phyd3-parser-compat

A compatability library implementing [PhyloXML](phyloxml.org/) parsing from the legacy version of [PhyD3](https://phyd3.bioinformatics-core.sites.vib.be).

## Installation

```bash
npm install @vibbioinfocore/phyd3-parser-compat
```

## Usage

In the browser:
```javascript
import {makeCompatTable, phyloxml} from "@vibbioinfocore/phyd3-parser-compat";

const parse = (text) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(text);
    return makeCompatTable(phyloxml.parse(doc));
};
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update/add tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
