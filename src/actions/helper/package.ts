/* eslint-disable sort-imports */
/* eslint-disable i18n-text/no-en */

import * as core from '@actions/core'

import fs from 'fs'

import Path from 'path'

const workspace = process.env.GITHUB_WORKSPACE

if (!workspace) {
    core.warning('There is no defined workspace')

    process.exit(core.ExitCode.Success)
}

const dir = Path.resolve(workspace)

const packagePath = Path.join(dir, 'package.json')

export async function getDependencyVersion(dependency: string): Promise<string> {
    const packageJson = await import(packagePath)

    return packageJson.devDependencies[dependency] || packageJson.dependencies[dependency]
}

export function createNpmInstallCommand(dependency: string): string {
    return `npm install --save-dev ${dependency}`
}

export function createYarnAddCommand(dependency: string): string {
    return `yarn add --dev ${dependency}`
}

export function isYarnRepo(): boolean {
    return fs.existsSync('yarn.lock')
}
