/* eslint-disable i18n-text/no-en */
/* eslint-disable sort-imports */

import * as core from '@actions/core'
import * as exec from '@actions/exec'

import * as CommandHelper from '../helper/command'
import * as PackageHelper from '../helper/package'

import { runTests } from '../helper/execute-test'

import { JEST_ENVIRONMENTS, TEST_FRAMEWORKS, KNOWN_JEST_ARGUMENTS } from '../../constants'

const THUNDRA_JEST_DEFAULT_ENVIRONMENT = '--env=@thundra/core/dist/bootstrap/foresight/jest/JestDefaultEnvironment.js'

const THUNDRA_JEST_JSDOM_ENVIRONMENT = '--env=@thundra/core/dist/bootstrap/foresight/jest/JestEnvironmentJsdom.js'

const THUNDRA_JEST_NODE_ENVIRONMENT = '--env=@thundra/core/dist/bootstrap/foresight/jest/JestEnvironmentNode.js'

const JEST_DEFAULT_ARGUMENTS = ['--testRunner=jest-circus/runner']

const JEST_WORKER_ARGUMENTS = ['--maxWorkers=50%']

const environment: string = core.getInput('environment')
const command: string = core.getInput('command')
const appendThundraArguments: string = core.getInput('append_thundra_arguments')

function parseAndReplaceCommand(commandStr: string): string | undefined {
    const parsedCommand = CommandHelper.parseCommand(commandStr)

    const hasOperator = parsedCommand.some(x => typeof x === 'object' && x.op)
    if (!hasOperator) {
        return
    }

    const orginalCommandPieces = []
    const newCommandPieces = []

    const startIndex = parsedCommand.indexOf('jest')

    let addWorkerFlag = true
    for (let i = startIndex; i < parsedCommand.length; i++) {
        const piece = parsedCommand[i]

        if (typeof piece === 'object' && piece.op) {
            break
        }

        if (
            addWorkerFlag &&
            (piece.startsWith(KNOWN_JEST_ARGUMENTS.runInBand.value) ||
                piece.startsWith(KNOWN_JEST_ARGUMENTS.runInBand.alias) ||
                piece.startsWith(KNOWN_JEST_ARGUMENTS.maxWorkers.value) ||
                piece.startsWith(KNOWN_JEST_ARGUMENTS.maxWorkers.alias))
        ) {
            addWorkerFlag = false
        }

        orginalCommandPieces.push(piece)

        if (
            piece.startsWith(KNOWN_JEST_ARGUMENTS.testRunner.value) ||
            piece.startsWith(KNOWN_JEST_ARGUMENTS.env.value)
        ) {
            continue
        }

        newCommandPieces.push(piece)
    }

    const willBeReplaced = orginalCommandPieces.join(' ')

    if (addWorkerFlag) {
        JEST_DEFAULT_ARGUMENTS.push(...JEST_WORKER_ARGUMENTS)
    }

    newCommandPieces.push(...JEST_DEFAULT_ARGUMENTS)

    return commandStr.replace(willBeReplaced, newCommandPieces.join(' '))
}

export default async function run(): Promise<void> {
    core.info(`[Thundra] Jest will run test for environment ${environment}...`)

    const jestVersion = await PackageHelper.getDependencyVersion('jest')
    if (!jestVersion) {
        core.warning(`Jest must be added in project`)

        process.exit(core.ExitCode.Success)
    }

    const jestCircusVersion = await PackageHelper.getDependencyVersion('jest-circus')
    if (!jestCircusVersion) {
        const jestCircusInstallCmd = PackageHelper.isYarnRepo()
            ? PackageHelper.createYarnAddCommand(`jest-circus@${jestVersion}`)
            : PackageHelper.createNpmInstallCommand(`jest-circus@${jestVersion}`)

        await exec.exec(jestCircusInstallCmd, [], { ignoreReturnCode: true })
    }

    environment === JEST_ENVIRONMENTS.node
        ? JEST_DEFAULT_ARGUMENTS.push(THUNDRA_JEST_NODE_ENVIRONMENT)
        : environment === JEST_ENVIRONMENTS.jsdom
        ? JEST_DEFAULT_ARGUMENTS.push(THUNDRA_JEST_JSDOM_ENVIRONMENT)
        : JEST_DEFAULT_ARGUMENTS.push(THUNDRA_JEST_DEFAULT_ENVIRONMENT)

    process.env['THUNDRA_JEST_ARGUMENTS'] = JEST_DEFAULT_ARGUMENTS.join(' ')

    const commandPieces = CommandHelper.parseCommand(command)
    const commandArgs = CommandHelper.getCommandPart(commandPieces)
    const commandKeyword = commandArgs[commandArgs.length - 1]

    const commandStr = await PackageHelper.getScript(commandKeyword)
    if (!commandStr) {
        core.warning(`Script ${commandKeyword} did not found !`)

        process.exit(core.ExitCode.Success)
    }

    const isScriptIncludesJest = commandStr.includes(TEST_FRAMEWORKS.jest)

    if (appendThundraArguments && isScriptIncludesJest) {
        try {
            const parsedCommand = parseAndReplaceCommand(commandStr)
            if (!parsedCommand) {
                throw new Error('')
            }

            const updatedPckJson = await PackageHelper.updateScript(commandKeyword, parsedCommand)

            await PackageHelper.updateFile(PackageHelper.packagePath, JSON.stringify(updatedPckJson))

            process.env['THUNDRA_JEST_ARGUMENTS'] = JEST_DEFAULT_ARGUMENTS.join(' ')

            await runTests(command)
        } catch (error) {
            const args = PackageHelper.isYarnRepo() ? JEST_DEFAULT_ARGUMENTS : ['--', ...JEST_DEFAULT_ARGUMENTS]

            await runTests(command, args)
        }
    } else {
        core.warning(`Thundra jest arguments did not appended to command. 
            Environment variable "THUNDRA_JEST_ARGUMENTS" must be added to command manually`)

        await runTests(command)
    }
}
