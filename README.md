# dtdl-parser library

A library for parsing and validating (DTDL)[https://learn.microsoft.com/en-us/azure/digital-twins/concepts-models] ontologies.

## Installation / Adding to the Package.json

`@digicatapult/dtdl-parser` are available as an [npm package](https://www.npmjs.com/package/@digicatapult/dtdl-parser). In order to use your local version in the project please use `npm link` more on it -> [here](https://docs.npmjs.com/cli/v10/commands/npm-link) and below in this document

```sh
// with npm
npm install @digicatapult/ui-component-library
```

## Basic Usage

Install dependencies

```javascript
import { parseDirectories,  validateDirectories, getInterop } from "dtdl-parser"


const parser = await getInterop()
const parsedDtdl = parseDirectories('../dtdl/simple', parser)
```

