import fs from 'fs'
import path from 'path'
import type { ModelingException } from '../types/DtdlErr.d.ts'
import type { DtdlObjectModel, InterfaceInfo } from '../types/DtdlOm.d.ts'
import { errorHandler, isModelingException, isResolutionException } from './error.js'
import type { Parser } from './interop.js'

const { log, error } = console

export type * from '../types/DtdlErr.d.ts'
export type * from '../types/DtdlOm.d.ts'
export { getInterop } from './interop.js'

export const searchForJsonFiles = (directory: string): string[] => {
  if (!fs.existsSync(directory)) {
    error(`'${directory}' not a valid filepath`)
    return []
  }

  return fs
    .readdirSync(directory)
    .map((file) => path.join(directory, file))
    .reduce((jsonFiles, fullPath) => {
      if (fs.statSync(fullPath).isDirectory()) {
        return jsonFiles.concat(searchForJsonFiles(fullPath)) //recursive
      } else if (path.extname(fullPath) === '.json') {
        return jsonFiles.concat(fullPath)
      }
      return jsonFiles
    }, [] as string[])
}

const readJsonFile = (filepath: string): unknown | null => {
  try {
    const file = fs.readFileSync(filepath, 'utf-8')
    const json = JSON.parse(file)
    return json
  } catch (err) {
    error(`Invalid JSON at '${filepath}'`)
    error(err)
    return null
  }
}

const combineJson = (filepaths: string[]) => {
  const combinedJson: unknown[] = []

  for (const filepath of filepaths) {
    const json = readJsonFile(filepath)
    if (json === null) {
      return null // exit on any error
    }
    combinedJson.push(json)
  }

  return combinedJson
}

const validateFile = (filepath: string, parserModule: Parser, incResolutionException: boolean): boolean => {
  try {
    const file = fs.readFileSync(filepath, 'utf-8')
    parserModule.parse(file)
    log(`Successfully validated '${filepath}'`)
    return true
  } catch (err) {
    if (!incResolutionException && isResolutionException(err)) {
      // ignore resolution exception
      log(`Successfully validated '${filepath}'`)
      return true
    }
    error(`Error parsing '${filepath}'`)
    errorHandler(err)
    return false
  }
}

export const parseDtdl = (json: string, parserModule: Parser): DtdlObjectModel | ModelingException => {
  try {
    const model = JSON.parse(parserModule.parse(json)) as DtdlObjectModel
    log(`Successfully parsed`)
    return model
  } catch (err) {
    error(`Error parsing`)
    return errorHandler(err)
  }
}

export const validateDirectories = (directory: string, parser: Parser, incResolutionException: boolean): boolean => {
  log(`${parser.parserVersion()}\n`)
  log(`Validating DTDL at: '${directory}'`)

  const filepaths = searchForJsonFiles(directory)
  if (filepaths.length < 1) return false

  log(`Found ${filepaths.length} files:`)
  log(filepaths)

  for (const filepath of filepaths) {
    const isValid = validateFile(filepath, parser, incResolutionException)
    if (!isValid) return false // stop validating if error
  }

  log(`All files validated!\n`)
  return true
}

export const parseDirectories = (directory: string, parser: Parser): DtdlObjectModel | null => {
  log(`${parser.parserVersion()}\n`)
  log(`Parsing DTDL at: '${directory}'`)

  const filepaths = searchForJsonFiles(directory)
  if (filepaths.length < 1) return null

  log(`Found ${filepaths.length} files:`)
  log(filepaths)

  const fullJson = combineJson(filepaths)
  if (fullJson === null) return null

  const fullModel = parseDtdl(JSON.stringify(fullJson), parser)
  if (isModelingException(fullModel)) {
    log('Error while parsing directories:')
    log(fullModel)
    return null
  }

  log(`All files parsed!\n`)
  log(`Entities:`)
  log(Object.keys(fullModel))

  // Example type guard
  const interfaces: InterfaceInfo[] = Object.values(fullModel).filter(
    (value): value is InterfaceInfo => value.EntityKind === 'Interface'
  )
  log(`Number of interfaces: ${interfaces.length}`)

  return fullModel
}
