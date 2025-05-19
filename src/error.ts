import type { ModelingException, ParsingException, ResolutionException } from '../types/DtdlErr.d.ts'

const { error } = console

const isParsingEx = (exception: ModelingException): exception is ParsingException => {
  return exception.ExceptionKind === 'Parsing'
}

const isResolutionEx = (exception: ModelingException): exception is ResolutionException => {
  return exception.ExceptionKind === 'Resolution'
}

export const isResolutionException = (err: unknown) => {
  if (!(err instanceof Error)) return false
  return isResolutionEx(JSON.parse(err.message))
}

export const isModelingException = (input: unknown): input is ModelingException => {
  if (typeof input === 'object' && input !== null && 'ExceptionKind' in input) {
    const exception = input as ModelingException
    return isParsingEx(exception) || isResolutionEx(exception)
  }
  return false
}

export const errorHandler = (err: unknown): ModelingException => {
  try {
    if (err instanceof Error) {
      const exception = JSON.parse(err.message) as ModelingException

      if (isParsingEx(exception) || isResolutionEx(exception)) {
        return exception
      }
    }

    return {
      ExceptionKind: 'Parsing',
      Errors: [
        {
          Cause: 'An unknown error occurred.',
          Action: 'Check the input or contact support.',
          ValidationID: 'unknown:error',
          Value: JSON.stringify(err),
        },
      ],
    } as const
  } catch (parseErr) {
    error('Failed to parse error message:', parseErr)
    return {
      ExceptionKind: 'Parsing',
      Errors: [
        {
          Cause: 'Failed to parse error message.',
          Action: 'Ensure the parser returns valid ModelingException JSON.',
          ValidationID: 'error:unparseableException',
          Value: JSON.stringify(err),
        },
      ],
    } as const
  }
}
