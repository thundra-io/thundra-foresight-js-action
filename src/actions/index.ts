import JestAction from './jest'

const FrameworkTypes = {
    jest: 'jest'
}

const actions = {
    [FrameworkTypes.jest]: JestAction
}

export function isValidFramework(framework: string): boolean {
    return FrameworkTypes[framework as keyof typeof FrameworkTypes] !== undefined
}

export function getAction(framework: string): Function | undefined {
    return actions[framework]
}
