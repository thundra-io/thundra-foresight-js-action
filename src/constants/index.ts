export const MIN_THUNDRA_AGENT_VERSION = '2.13.0'

export const TEST_FRAMEWORKS = {
    jest: 'jest'
}

export const JEST_ENVIRONMENTS = {
    node: 'node',
    jsdom: 'jsdom'
}

export const KNOWN_JEST_ARGUMENTS = {
    env: {
        value: '--env'
    },
    testRunner: {
        value: '--testRunner'
    },
    maxWorkers: {
        alias: '-w',
        value: '--maxWorkers'
    },
    runInBand: {
        alias: '-i',
        value: '--runInBand'
    }
}
