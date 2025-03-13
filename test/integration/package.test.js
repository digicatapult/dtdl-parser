import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getInterop, parseDirectories, parseDtdl, validateDirectories } from '../../build/index.js'

const fixturesDirPath = path.resolve('dtdl/simple')
const fixturesFilepath = path.resolve('dtdl/simple/simple.json')
const errorFilepath = path.resolve('dtdl/error/error.json')

const emptyEntityProperties = {
  SupplementalTypes: [],
  SupplementalProperties: {},
  UndefinedTypes: [],
  UndefinedProperties: {},
  description: {},
  languageMajorVersion: 2,
  displayName: {},
  ChildOf: null,
  DefinedIn: null,
}
const emptyInterfaceProperties = {
  contents: {},
  commands: {},
  components: {},
  properties: {},
  relationships: {},
  telemetries: {},
  extendedBy: [],
  extends: [],
  schemas: [],
  comment: null,
}

const exampleModel = {
  'dtmi:com:example:base;1': {
    ...emptyEntityProperties,
    ...emptyInterfaceProperties,
    languageMajorVersion: 3,
    Id: 'dtmi:com:example:base;1',
    ChildOf: 'dtmi:com:example;1',
    DefinedIn: 'dtmi:com:example;1',
    EntityKind: 'Interface',
    ClassId: 'dtmi:dtdl:class:Interface;3',
    extendedBy: ['dtmi:com:example;1'],
  },
  'dtmi:com:example;1': {
    ...emptyEntityProperties,
    ...emptyInterfaceProperties,
    languageMajorVersion: 3,
    Id: 'dtmi:com:example;1',
    EntityKind: 'Interface',
    ClassId: 'dtmi:dtdl:class:Interface;3',
    extends: ['dtmi:com:example:base;1'],
  },
}

describe('package exports', () => {
  it('getInterop to return parser', async () => {
    const parser = await getInterop()
    expect(parser.parserVersion()).to.be.a('string')
  })

  it('parseDirectories to return parsed model', async () => {
    const parser = await getInterop()
    const model = parseDirectories(fixturesDirPath, parser)
    expect(model).to.deep.equal(exampleModel)
  })

  it('validateDirectories to return true', async () => {
    const parser = await getInterop()
    const valid = validateDirectories(fixturesDirPath, parser)
    expect(valid).to.equal(true)
  })

  it('parseDtdl to return parsed model', async () => {
    const parser = await getInterop()
    const json = await readFile(fixturesFilepath, 'utf-8')
    const model = parseDtdl(json, parser)
    expect(model).to.deep.equal(exampleModel)
  })

  it('parseDtdl to return null on error', async () => {
    const parser = await getInterop()
    const json = await readFile(errorFilepath, 'utf-8')
    const model = parseDtdl(json, parser)
    expect(model).to.deep.equal(null)
  })
})
