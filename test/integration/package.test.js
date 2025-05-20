import { expect } from 'chai'
import { describe, it } from 'mocha'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getInterop, parseDirectories, parseDtdl, validateDirectories } from '../../build/index.js'
import { v4model } from './fixtures.js'

const fixturesDirPath = path.resolve('dtdl/simple')
const fixturesFilepath = path.resolve('dtdl/simple/simple.json')
const errorFilepath = path.resolve('dtdl/error/error.json')

const fixturesDirPathV4 = path.resolve('dtdl/v4')

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

  it('parseDtdl to return ModelingException on error', async () => {
    const parser = await getInterop()
    const json = await readFile(errorFilepath, 'utf-8')
    const model = parseDtdl(json, parser)
    expect(model.ExceptionKind).to.equal('Parsing')
  })
})

describe('package exports for DTDL v4', () => {
  it('expect language model to be 4', async () => {
    const parser = await getInterop()
    const model = parseDirectories(fixturesDirPathV4, parser)
    expect(model['dtmi:com:example:base;1'].languageMajorVersion).to.equal(4)
  })

  it('parseDirectories to return parsed model for v4', async () => {
    const parser = await getInterop()
    const model = parseDirectories(fixturesDirPathV4, parser)
    expect(model).to.deep.equal(v4model)
  })
})

describe('package exports for DTDL v4 - new schema types', () => {
  it('parseDtdl to correctly parse models with new primitive schema types', async () => {
    const parser = await getInterop()
    const filepath = path.resolve('dtdl/v4/v4.json')
    const json = await readFile(filepath, 'utf-8')
    const model = parseDtdl(json, parser)
    expect(model).to.have.property('dtmi:com:example;1')
    const exampleInterface = model['dtmi:com:example;1']

    expect(exampleInterface.ClassId).to.equal('dtmi:dtdl:class:Interface;4')
    expect(exampleInterface.contents).to.have.property('uuidType')
    expect(model[exampleInterface.contents.uuidType].schema).to.equal('dtmi:dtdl:instance:Schema:uuid;4')

    expect(exampleInterface.contents).to.have.property('unsignedShortType')
    expect(model[exampleInterface.contents.unsignedShortType].schema).to.equal(
      'dtmi:dtdl:instance:Schema:unsignedShort;4'
    )

    expect(exampleInterface.contents).to.have.property('unsignedLongType')
    expect(model[exampleInterface.contents.unsignedLongType].schema).to.equal(
      'dtmi:dtdl:instance:Schema:unsignedLong;4'
    )

    expect(exampleInterface.contents).to.have.property('unsignedIntegerType')
    expect(model[exampleInterface.contents.unsignedIntegerType].schema).to.equal(
      'dtmi:dtdl:instance:Schema:unsignedInteger;4'
    )

    expect(exampleInterface.contents).to.have.property('unsignedByteType')
    expect(model[exampleInterface.contents.unsignedByteType].schema).to.equal(
      'dtmi:dtdl:instance:Schema:unsignedByte;4'
    )

    expect(exampleInterface.contents).to.have.property('shortType')
    expect(model[exampleInterface.contents.shortType].schema).to.equal('dtmi:dtdl:instance:Schema:short;4')

    expect(exampleInterface.contents).to.have.property('decimalType')
    expect(model[exampleInterface.contents.decimalType].schema).to.equal('dtmi:dtdl:instance:Schema:decimal;4')

    expect(exampleInterface.contents).to.have.property('bytesType')
    expect(model[exampleInterface.contents.bytesType].schema).to.equal('dtmi:dtdl:instance:Schema:bytes;4')

    expect(exampleInterface.contents).to.have.property('byteType')
    expect(model[exampleInterface.contents.byteType].schema).to.equal('dtmi:dtdl:instance:Schema:byte;4')
  })

  it('parseDtdl to correctly parse models with scaledDecimal type', async () => {
    const parser = await getInterop()
    const filepath = path.resolve('dtdl/v4/v4.json')
    const json = await readFile(filepath, 'utf-8')
    const model = parseDtdl(json, parser)
    expect(model).to.have.property('dtmi:com:example;1')
    const exampleInterface = model['dtmi:com:example;1']

    expect(exampleInterface.ClassId).to.equal('dtmi:dtdl:class:Interface;4')
    expect(exampleInterface.contents).to.have.property('scaledDecimalType')
    expect(model[exampleInterface.contents.scaledDecimalType].schema).to.equal('dtmi:standard:schema:scaledDecimal;4')
  })

  it('parseDtdl to correctly parse complex types that are self referential', async () => {
    const parser = await getInterop()
    const filepath = path.resolve('dtdl/v4/v4.json')
    const json = await readFile(filepath, 'utf-8')
    const model = parseDtdl(json, parser)
    expect(model).to.have.property('dtmi:com:example;1')
    const schemaEntity = model['dtmi:com:example:InterfaceSchema;1']

    expect(schemaEntity.ClassId).to.equal('dtmi:dtdl:class:Object;4')
    expect(model[schemaEntity.fields[0]].schema).to.equal('dtmi:com:example:InterfaceSchema;1')
  })

  it('parse Dtdl to correctly parse complex types that are deep nested at least 6 levels', async () => {
    const parser = await getInterop()
    const filepath = path.resolve('dtdl/v4/v4.json')
    const json = await readFile(filepath, 'utf-8')
    const model = parseDtdl(json, parser)
    expect(model).to.have.property('dtmi:com:DeepestLevel;1')
  })
  it('parse Dtdl to correctly parse Interface that are deep nested at least 11 levels', async () => {
    const parser = await getInterop()
    const filepath = path.resolve('dtdl/v4/inheritedInterface.json')
    const json = await readFile(filepath, 'utf-8')
    const model = parseDtdl(json, parser)
    expect(model).to.have.property('dtmi:com:example:base11;1')
  })
  it('parse Dtdl with command request and response being nullable', async () => {
    const parser = await getInterop()
    const filepath = path.resolve('dtdl/v4/nullableCommand.json')
    const json = await readFile(filepath, 'utf-8')
    const model = parseDtdl(json, parser)
    expect(model['dtmi:com:NullableRequest;1'].nullable).to.equal(true)
    expect(model['dtmi:com:NullableResponse;1'].nullable).to.equal(true)
  })
  it('parseDtdl to return structured error object on invalid JSON', async () => {
    const parser = await getInterop()
    const json = await readFile(errorFilepath, 'utf-8')
    const result = parseDtdl(json, parser)

    expect(result.ExceptionKind).to.equal('Parsing')
    expect(result.Errors[0]).to.have.property('Cause')
    expect(result.Errors[0]).to.have.property('Action')
  })
  it('parseDtdl to return fallback error object on malformed error', () => {
    const fakeParser = {
      parse: () => {
        throw new Error('This is not JSON')
      },
    }

    const json = '{}'
    expect(() => parseDtdl(json, fakeParser)).to.throw('This is not JSON')
  })
})
