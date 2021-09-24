import * as exec from '@actions/exec'

export async function runTests(command: string, args: string[], envVariables = {}): Promise<number> {
    return exec.exec(command, args, {
        env: {
            ...process.env,
            ...envVariables
        }
    })
}
