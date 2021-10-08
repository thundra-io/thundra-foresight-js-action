/* eslint-disable sort-imports */
/* eslint-disable i18n-text/no-en */

import * as actions from './actions/index'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as semver from 'semver'

import * as Helper from './actions/helper/package'

import { MIN_THUNDRA_AGENT_VERSION } from './constants'

const apikey: string = core.getInput('apikey')
const project_id: string = core.getInput('project_id')
const framework: string = core.getInput('framework')
const agent_version: string = core.getInput('agent_version')

const thundraDep = agent_version ? `@thundra/core@${agent_version}` : '@thundra/core'

if (!apikey) {
    core.warning('Thundra API Key is not present. Exiting early...')
    core.warning('Instrumentation failed.')

    process.exit(core.ExitCode.Success)
}

if (!project_id) {
    core.warning('Thundra Project ID is not present. Exiting early...')
    core.warning('Instrumentation failed.')

    process.exit(core.ExitCode.Success)
}

if (agent_version && semver.lt(agent_version, MIN_THUNDRA_AGENT_VERSION)) {
    core.setFailed(`Thundra Nodejs Agent prior to ${MIN_THUNDRA_AGENT_VERSION} doesn't work with this action`)

    process.exit(core.ExitCode.Success)
}

if (!actions.isValidFramework(framework) || !actions.isValidFramework(framework.toLowerCase())) {
    core.warning('Framework must be take one of these values: jest...')

    process.exit(core.ExitCode.Success)
}

core.exportVariable('THUNDRA_APIKEY', apikey)
core.exportVariable('THUNDRA_AGENT_TEST_PROJECT_ID', project_id)

async function run(): Promise<void> {
    try {
        core.info(`[Thundra] Initializing the Thundra Action....`)

        const thundraInstallCmd = Helper.isYarnRepo()
            ? Helper.createYarnAddCommand(thundraDep)
            : Helper.createNpmInstallCommand(thundraDep)

        await exec.exec(thundraInstallCmd, [], { ignoreReturnCode: true })

        core.info(`[Thundra] @thundra/core installed`)

        const action: Function | undefined = actions.getAction(framework)
        if (!action) {
            core.warning(`There is no defined action for framework: ${framework}`)

            process.exit(core.ExitCode.Success)
        }

        await action()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        core.setFailed(error.message)
    }
}

run()
