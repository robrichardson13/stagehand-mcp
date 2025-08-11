import { z } from 'zod'

export const NavigateSchema = z.object({
    url: z.string().url('Must be a valid URL').describe('The URL to navigate to'),
})

export const ActSchema = z.object({
    instruction: z.string().min(1, 'Instruction is required').describe('The instruction to execute'),
    variables: z
        .record(z.string())
        .optional()
        .describe(
            'Variables to be substituted in the instruction. Replaces "%variable_name%" in the instruction with the value of the variable.',
        ),
})

export const ExtractSchema = z.object({
    instruction: z.string().min(1, 'Instruction is required').optional().describe('The instruction to execute'),
    schema: z.any().optional().describe('JSON schema for the extracted data'),
})

export const ObserveSchema = z.object({
    instruction: z.string().optional().describe('The instruction to execute'),
})

export const ScreenshotSchema = z.object({
    fullPage: z
        .boolean()
        .optional()
        .default(true)
        .describe(
            'When true, takes a screenshot of the full scrollable page, instead of the currently visible viewport. Defaults to false.',
        ),
    path: z
        .string()
        .optional()
        .describe(
            "The file path to save the image to. The screenshot type will be inferred from file extension. If path is a relative path, then it is resolved relative to the current working directory. If no path is provided, the image won't be saved to the disk.",
        ),
})

export type NavigateInput = z.infer<typeof NavigateSchema>
export type ActInput = z.infer<typeof ActSchema>
export type ExtractInput = z.infer<typeof ExtractSchema>
export type ObserveInput = z.infer<typeof ObserveSchema>
export type ScreenshotInput = z.infer<typeof ScreenshotSchema>
