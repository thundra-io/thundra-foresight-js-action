/* eslint-disable @typescript-eslint/no-explicit-any */

import Minimist from 'minimist'

import ShellQuote from 'shell-quote'

export function parseCommand(command: string): any[] {
    return ShellQuote.parse(command)
}

export function minimistArgs(args: string[]): any {
    return Minimist(args)
}

export function getCommandPart(args: string[]): any {
    return minimistArgs(args)['_']
}
