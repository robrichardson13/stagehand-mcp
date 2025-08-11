import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { Stagehand } from '@browserbasehq/stagehand'
import { NavigateSchema, ActSchema, ExtractSchema, ObserveSchema, ScreenshotSchema } from './types.js'
import { z } from 'zod'

interface StagehandConfig {
    modelName?: string
    modelApiKey?: string
    executablePath?: string
    headless?: boolean
    cdpUrl?: string
}

export class StagehandMCPServer {
    private server: McpServer
    private stagehand: Stagehand | null = null
    private config: StagehandConfig

    private convertJsonToZodSchema(jsonSchema: any): z.ZodObject<any> {
        if (!jsonSchema || typeof jsonSchema !== 'object') {
            return z.object({})
        }

        if (jsonSchema.type === 'object' && jsonSchema.properties) {
            const shape: Record<string, z.ZodSchema<any>> = {}

            for (const [key, value] of Object.entries(jsonSchema.properties)) {
                shape[key] = this.convertJsonPropertyToZodSchema(value)
            }

            return z.object(shape)
        }

        // If not an object schema, wrap in a generic object
        return z.object({ value: z.any() })
    }

    private convertJsonPropertyToZodSchema(jsonSchema: any): z.ZodSchema<any> {
        if (!jsonSchema || typeof jsonSchema !== 'object') {
            return z.any()
        }

        switch (jsonSchema.type) {
            case 'string':
                return z.string()
            case 'number':
                return z.number()
            case 'boolean':
                return z.boolean()
            case 'array':
                return z.array(jsonSchema.items ? this.convertJsonPropertyToZodSchema(jsonSchema.items) : z.any())
            case 'object':
                if (jsonSchema.properties) {
                    const shape: Record<string, z.ZodSchema<any>> = {}
                    for (const [key, value] of Object.entries(jsonSchema.properties)) {
                        shape[key] = this.convertJsonPropertyToZodSchema(value)
                    }
                    return z.object(shape)
                }
                return z.object({})
            default:
                return z.any()
        }
    }

    constructor(config: StagehandConfig = {}) {
        this.config = {
            modelName: 'openai/gpt-4.1-mini',
            modelApiKey: process.env.OPENAI_API_KEY,
            executablePath: undefined,
            headless: false,
            cdpUrl: undefined,
            ...config,
        }

        this.server = new McpServer({
            name: 'stagehand-mcp',
            version: '1.0.0',
        })

        this.registerTools()
    }

    private async initializeStagehand(): Promise<void> {
        if (this.stagehand) return

        this.stagehand = new Stagehand({
            modelName: this.config.modelName,
            modelClientOptions: {
                apiKey: this.config.modelApiKey,
            },
            env: 'LOCAL',
            localBrowserLaunchOptions: {
                executablePath: this.config.executablePath,
                headless: this.config.headless,
                cdpUrl: this.config.cdpUrl,
            },
        })

        await this.stagehand.init()
    }

    private registerTools(): void {
        this.server.registerTool(
            'navigate',
            {
                title: 'Navigate',
                description: 'Navigate to a specific URL using Stagehand',
                inputSchema: NavigateSchema.shape,
            },
            async ({ url }) => {
                await this.initializeStagehand()

                if (!this.stagehand?.page) {
                    throw new Error('Stagehand page not available')
                }

                await this.stagehand.page.goto(url)

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Successfully navigated to: ${url}`,
                        },
                    ],
                }
            },
        )

        this.server.registerTool(
            'act',
            {
                title: 'Act',
                description: 'Perform an action on the current page using natural language instructions',
                inputSchema: ActSchema.shape,
            },
            async ({ instruction, variables }) => {
                await this.initializeStagehand()

                if (!this.stagehand?.page) {
                    throw new Error('Stagehand page not available')
                }

                const result = await this.stagehand.page.act({
                    action: instruction,
                    variables,
                })

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Action completed: ${instruction}\nResult: ${JSON.stringify(result, null, 2)}`,
                        },
                    ],
                }
            },
        )

        this.server.registerTool(
            'extract',
            {
                title: 'Extract',
                description:
                    'Extract structured data from the current page. Optionally provide a JSON schema to structure the extraction.',
                inputSchema: ExtractSchema.shape,
            },
            async ({ instruction, schema }) => {
                await this.initializeStagehand()

                if (!this.stagehand?.page) {
                    throw new Error('Stagehand page not available')
                }

                const result = schema
                    ? await this.stagehand.page.extract({ instruction, schema: this.convertJsonToZodSchema(schema) })
                    : instruction
                      ? await this.stagehand.page.extract(instruction)
                      : await this.stagehand.page.extract()

                if (schema) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    success: true,
                                    message: 'Data extracted successfully',
                                    data: result
                                }, null, 2),
                            },
                        ],
                    }
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Data extracted successfully:\n${JSON.stringify(result, null, 2)}`,
                        },
                    ],
                }
            },
        )

        this.server.registerTool(
            'observe',
            {
                title: 'Observe',
                description: 'Get actionable elements from the current page',
                inputSchema: ObserveSchema.shape,
            },
            async ({ instruction }) => {
                await this.initializeStagehand()

                if (!this.stagehand?.page) {
                    throw new Error('Stagehand page not available')
                }

                const result = instruction
                    ? await this.stagehand.page.observe(instruction)
                    : await this.stagehand.page.observe()

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Observation results:\n${JSON.stringify(result, null, 2)}`,
                        },
                    ],
                }
            },
        )

        this.server.registerTool(
            'screenshot',
            {
                title: 'Screenshot',
                description: 'Capture a screenshot of the current page',
                inputSchema: ScreenshotSchema.shape,
            },
            async ({ fullPage, path }) => {
                await this.initializeStagehand()

                if (!this.stagehand?.page) {
                    throw new Error('Stagehand page not available')
                }

                const screenshot = await this.stagehand.page.screenshot({
                    fullPage,
                    path,
                    type: 'png',
                })

                if (path) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Screenshot saved to: ${path}`,
                            },
                        ],
                    }
                }

                return {
                    content: [
                        {
                            type: 'image',
                            data: screenshot.toString('base64'),
                            mimeType: 'image/png',
                        },
                    ],
                }
            },
        )
    }

    public getServer(): McpServer {
        return this.server
    }

    public async cleanup(): Promise<void> {
        if (!this.stagehand) {
            return
        }

        try {
            await this.stagehand.close()
        } catch (error) {
            // console.error('Error closing Stagehand:', error)
        }
        this.stagehand = null
    }
}
