import ts from 'typescript'
import path from 'node:path'

function runTypeScriptBuildVerification() {
  console.log('================================================================================')
  console.log('  TYPESCRIPT COMPILER & BUILD INTEGRITY VERIFICATION')
  console.log('================================================================================\n')

  const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json')
  if (!configPath) {
    throw new Error('Could not find a valid tsconfig.json.')
  }

  const readConfigFileResult = ts.readConfigFile(configPath, ts.sys.readFile)
  if (readConfigFileResult.error) {
    throw new Error(`Error reading tsconfig.json: ${readConfigFileResult.error.messageText}`)
  }

  const basePath = path.dirname(configPath)
  const parsedCommandLine = ts.parseJsonConfigFileContent(
    readConfigFileResult.config,
    ts.sys,
    basePath
  )

  if (parsedCommandLine.errors.length > 0) {
    console.error('Errors parsing tsconfig.json:')
    parsedCommandLine.errors.forEach(err => console.error(err.messageText))
    throw new Error('tsconfig parsing failed.')
  }

  console.log(`Compiling ${parsedCommandLine.fileNames.length} TypeScript source files...`)

  const program = ts.createProgram({
    rootNames: parsedCommandLine.fileNames,
    options: parsedCommandLine.options,
  })

  const emitResult = program.emit()
  const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics)

  let errorCount = 0
  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.category === ts.DiagnosticCategory.Error) {
      errorCount++
      if (diagnostic.file) {
        const { line, character } = ts.getLineAndCharacterOfPosition(
          diagnostic.file,
          diagnostic.start!
        )
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
        console.error(
          `❌ [TS ERROR] ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
        )
      } else {
        console.error(
          `❌ [TS ERROR] ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`
        )
      }
    }
  })

  console.log(`\n================================================================================`)
  console.log(`  BUILD VERIFICATION RESULT:`)
  console.log(`  Source Files Checked : ${parsedCommandLine.fileNames.length}`)
  console.log(`  TypeScript Errors    : ${errorCount}`)
  console.log(`  Emit Skipped         : ${emitResult.emitSkipped}`)
  console.log(`================================================================================\n`)

  if (errorCount > 0 || emitResult.emitSkipped) {
    console.error(`Build failed with ${errorCount} TypeScript errors.`)
    process.exit(1)
  } else {
    console.log('✅ BUILD SUCCEEDED WITH ZERO ERRORS!')
  }
}

runTypeScriptBuildVerification()
