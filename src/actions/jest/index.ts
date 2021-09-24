/* eslint-disable i18n-text/no-en */
/* eslint-disable sort-imports */

import * as core from '@actions/core'
import * as exec from '@actions/exec'

import * as Helper from '../helper/package'

import { runTests } from '../helper/execute-test'

const THUNDRA_JEST_JSDOM_ENVIRONMENT = '--env=@thundra/core/dist/bootstrap/foresight/jest/JestEnvironmentJsdom.js'

const THUNDRA_JEST_NODE_ENVIRONMENT = '--env=@thundra/core/dist/bootstrap/foresight/jest/JestEnvironmentNode.js'

const JEST_DEFAULT_ARGUMENTS = ['--testRunner=jest-circus/runner']

const environment: string = core.getInput('environment')
const command: string = core.getInput('command')

export default async function run(): Promise<void> {
    core.info(`[Thundra] Jest will run test for environment ${environment}...`)

    const jestVersion = await Helper.getDependencyVersion('jest')
    if (!jestVersion) {
        core.warning(`Jest must be added in project`)

        process.exit(core.ExitCode.Success)
    }

    const jestCircusVersion = await Helper.getDependencyVersion('jest-circus')
    if (!jestCircusVersion) {
        const jestCircusInstallCmd = Helper.isYarnRepo()
            ? Helper.createYarnAddCommand(`jest-circus@${jestVersion}`)
            : Helper.createNpmInstallCommand(`jest-circus@${jestVersion}`)

        await exec.exec(jestCircusInstallCmd, [], { ignoreReturnCode: true })
    }

    environment === 'node'
        ? JEST_DEFAULT_ARGUMENTS.push(THUNDRA_JEST_NODE_ENVIRONMENT)
        : environment === 'jsdom'
        ? JEST_DEFAULT_ARGUMENTS.push(THUNDRA_JEST_JSDOM_ENVIRONMENT)
        : undefined

    const args = Helper.isYarnRepo() ? JEST_DEFAULT_ARGUMENTS : ['--', ...JEST_DEFAULT_ARGUMENTS]

    await runTests(command, args)
}
