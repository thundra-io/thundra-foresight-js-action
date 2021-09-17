import * as core from '@actions/core'

import * as runTestHelper from '../helper'

const THUNDRA_JEST_JSDOM_ENVIRONMENT = '--env=@thundra/core/dist/bootstrap/jest/JestEnvironmentJsdom.js'

const THUNDRA_JEST_NODE_ENVIRONMENT = '--env=@thundra/core/dist/bootstrap/jest/JestEnvironmentNode.js'

const JEST_DEFAULT_ARGUMENTS = ['--testRunner=jest-circus/runner']

const environment: string = core.getInput('environment')
const command: string = core.getInput('command')

export default async function run(): Promise<void> {
    core.info(`[Thundra] Jest will run test for environment ${environment}...`)

    environment === 'node'
        ? JEST_DEFAULT_ARGUMENTS.push(THUNDRA_JEST_NODE_ENVIRONMENT)
        : environment === 'jsdom'
        ? JEST_DEFAULT_ARGUMENTS.push(THUNDRA_JEST_JSDOM_ENVIRONMENT)
        : undefined

    const args = runTestHelper.isYarnRepo() ? JEST_DEFAULT_ARGUMENTS : ['--', ...JEST_DEFAULT_ARGUMENTS]

    await runTestHelper.runTests(command, args)
}
