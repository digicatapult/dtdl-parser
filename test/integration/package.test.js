import { expect } from 'chai'
import { describe, it } from 'mocha'
import path from 'node:path'
import { getInterop, parseDirectories } from '../../build/index.js'

const fixturesFilepath = path.resolve('dtdl/simple')

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

describe('integration test on build and package integrity', () => {
  describe('parser to function as expected', () => {
    it('parser to function as expected', async () => {
      const parser = await getInterop()
      const model = parseDirectories(fixturesFilepath, parser)
      expect(model).to.deep.equal(exampleModel)
    })
  })
})
