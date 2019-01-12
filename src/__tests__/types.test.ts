import {readdir} from 'fs'
import 'jest'
import {difference} from 'lodash'
import path from 'path'
import pify from 'pify'
import {
  CompilerOptions,
  createProgram,
  Diagnostic,
  DiagnosticCategory,
  ModuleKind,
  ScriptTarget,
} from 'typescript'

const compilerOptions: CompilerOptions = {
  noEmit: true,
  noImplicitAny: true,
  target: ScriptTarget.ESNext,
  module: ModuleKind.CommonJS,
  baseUrl: `${__dirname}/../../src`,
  paths: {
    'revali/*': ['*'],
  },
  strict: true,
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  esModuleInterop: true,
}

function getMessageText(d: Diagnostic): string {
  if (typeof d.messageText === 'string') {
    return d.messageText
  } else {
    return d.messageText.messageText
  }
}

function getFileName(d: Diagnostic): string {
  return d.file ? d.file.fileName : ''
}

function typeCheckFiles(fileNames: string[], expectError?: boolean): void {
  const program = createProgram(fileNames, compilerOptions)

  const errors = program
    .getSemanticDiagnostics()
    .filter(d => d.category === DiagnosticCategory.Error)

  // If we expect errors, every file should have an error
  if (expectError && errors.length !== fileNames.length) {
    // The files that should have type errors
    const fileNamesWithErrors = errors.map(getFileName)
    const errMsg = difference(fileNames, fileNamesWithErrors).reduce(
      (msg, fileName) => `${msg} - ${fileName}\n`,
      ''
    )

    throw new Error(`Expected the following file(s) to have type errors:\n\n${errMsg}`)
  }

  if (!expectError && errors.length >= 1) {
    const errMsg = errors
      .slice(0, 3)
      .map(d => `File '${getFileName(d)}': \n${getMessageText(d)}`)
      .reduce((msg, curMsg) => `${msg} - ${curMsg}\n\n`, '')

    throw new Error(`Unexpected type errors:\n\n${errMsg}`)
  }
}

async function getFilesInDir(...paths: string[]): Promise<string[]> {
  const files = await pify(readdir)(path.join(...paths))
  return files.map((file: string) => path.join(...paths, file))
}

describe('Decorator type validation', () => {
  it('passes for valid files', async () => {
    const validFiles = await getFilesInDir(__dirname, 'valid')
    await typeCheckFiles(validFiles, false)
  }, 30000)

  it('fails for invalid files', async () => {
    const invalidFiles = await getFilesInDir(__dirname, 'invalid')
    await typeCheckFiles(invalidFiles, true)
  }, 30000)
})
