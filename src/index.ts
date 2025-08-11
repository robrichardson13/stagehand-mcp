#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { StagehandMCPServer } from './stagehand-server.js'

function parseArgs(args: string[]) {
    const config: {
        modelName?: string
        modelApiKey?: string
        executablePath?: string
        headless?: boolean
        cdpUrl?: string
    } = {}

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--modelName' && i + 1 < args.length) {
            config.modelName = args[i + 1]
            i++
        } else if (args[i] === '--modelApiKey' && i + 1 < args.length) {
            config.modelApiKey = args[i + 1]
            i++
        } else if (args[i] === '--executablePath' && i + 1 < args.length) {
            config.executablePath = args[i + 1]
            i++
        } else if (args[i] === '--headless') {
            config.headless = true
        } else if (args[i] === '--cdpUrl' && i + 1 < args.length) {
            config.cdpUrl = args[i + 1]
            i++
        }
    }

    return config
}

async function runStdioServer(): Promise<void> {
    const config = parseArgs(process.argv.slice(2))
    const stagehandServer = new StagehandMCPServer(config)
    const transport = new StdioServerTransport()

    process.on('SIGINT', async () => {
        await stagehandServer.cleanup()
        process.exit(0)
    })

    process.on('SIGTERM', async () => {
        await stagehandServer.cleanup()
        process.exit(0)
    })

    try {
        await stagehandServer.getServer().connect(transport)
    } catch (error) {
        await stagehandServer.cleanup()
        process.exit(1)
    }
}

// Run the server when this file is executed directly
runStdioServer().catch(() => {
    process.exit(1)
})
