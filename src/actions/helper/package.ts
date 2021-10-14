/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sort-imports */
/* eslint-disable i18n-text/no-en */

import * as core from '@actions/core'

import fs from 'fs'

import Path from 'path'

import Util from 'util'

const WriteFile = Util.promisify(fs.writeFile)

const workspace = process.env.GITHUB_WORKSPACE

if (!workspace) {
    core.warning('There is no defined workspace')

    process.exit(core.ExitCode.Success)
}

const dir = Path.resolve(workspace)

const packagePath = Path.join(dir, 'package.json')

export async function getPackageJson(): Promise<any> {
    return await import(packagePath)
}

export async function getScript(scriptName: string): Promise<string | void> {
    const packageJson = await getPackageJson()
    if (packageJson.script && packageJson.script[scriptName]) {
        return packageJson.script[scriptName]
    }
}

export async function setScript(scriptName: string, scriptValue: string): Promise<void> {
    const packageJson = await getPackageJson()
    if (packageJson.script && packageJson.script[scriptName]) {
        packageJson.script[scriptName] = scriptValue
    }
}

export async function getDependencyVersion(dependency: string): Promise<string> {
    const packageJson = await getPackageJson()

    return packageJson.devDependencies[dependency] || packageJson.dependencies[dependency]
}

export function createNpmInstallCommand(dependency: string): string {
    return `npm install --save-dev ${dependency}`
}

export function createYarnAddCommand(dependency: string): string {
    return `yarn add ${dependency} --dev -W`
}

export function isYarnRepo(): boolean {
    return fs.existsSync('yarn.lock')
}

export async function updateFile(filePath: string, content: string): Promise<void> {
    await WriteFile(filePath, content)
}
