import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { DtdlObjectModel, getInterop, InterfaceInfo, parseDirectories } from '../../build/index.js'
import { serialiseInterface } from '../../build/serialise.js'

const fixturesFilepath = path.resolve('dtdl/simple')
const dtdlJson = readFileSync(path.join(fixturesFilepath, 'simple.json'), 'utf8')

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

const exampleModel: DtdlObjectModel = {
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

describe('integration test on build and package integrity', () => {
  it('parses directories to DtdlObjectModel', async () => {
    const parser = await getInterop()
    const model = parseDirectories(fixturesFilepath, parser)
    expect(model).to.deep.equal(exampleModel)
  })

  it.only('serialises and deserialises DtdlObjectModel', async () => {
    const parser = await getInterop()
    const model = parseDirectories(fixturesFilepath, parser)
    if (!model) throw new Error('Model is null')

    const interfaces: InterfaceInfo[] = Object.values(model).filter(
      (value): value is InterfaceInfo => value.EntityKind === 'Interface'
    )

    const serialised = serialiseInterface(interfaces[1])
    expect(serialised).to.deep.equal(JSON.parse(dtdlJson))
  })
})
