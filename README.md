# dtdl-parser

A library for parsing and validating (DTDL)[https://learn.microsoft.com/en-us/azure/digital-twins/concepts-models] ontologies.

## Prerequisites

`node` >= 20
`dotnet` [CLI](https://learn.microsoft.com/en-us/dotnet/core/install/)
Run `dotnet workload install wasm-tools` to install `wasm-tools`

## Getting started

Install dependencies

`npm install`

Build javascript files

`npm run build`

Basic usage

```javascript
import { parseDirectories,  validateDirectories} from "dtdl-parser"
import { getInterop } from 'dtdl-parser/src/interop'

const parser = await getInterop()
parseDirectories('../dtdl/simple', parser)
```