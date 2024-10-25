import { parseDirectories, getInterop } from '@digicatapult/dtdl-parser'
import { expect } from 'chai'
import { exampleModel, fixturesFilepath } from '../../src/__tests__/index.test'

describe('integration test on build and package integrity', () => {
    describe('parser to function as expected', async () => {
        const parser = await getInterop()
        it('parser to function as expected', () => {
            const model = parseDirectories(fixturesFilepath, parser)
            expect(model).to.equal(exampleModel)
        })
    })
})