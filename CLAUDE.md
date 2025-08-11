# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server that exposes Stagehand browser automation capabilities. Stagehand is an AI-powered browser automation framework that allows natural language interactions with web pages. This MCP server makes those capabilities available to Claude and other MCP clients.

## Key Commands

### Development Commands

- `npm run build` - Compile TypeScript to JavaScript in dist/ directory
- `npm run dev` - Run TypeScript compiler in watch mode for development
- `npm run clean` - Remove the dist/ directory
- `npm start` - Run the MCP server using stdio transport
- `npm run inspector` - Launch the MCP Inspector for testing and debugging

### CLI Arguments

The server accepts the following command-line arguments:

- `--modelName` - Override the default model (default: "openai/gpt-4.1-mini")
- `--modelApiKey` - Override the API key (default: OPENAI_API_KEY environment variable)
- `--executablePath` - Override the browser executable path (default: Google Chrome on macOS)
- `--headless` - Run in headless mode

### Testing and Debugging

- Use `npm run inspector` to test the MCP server with the official MCP Inspector tool
- The server uses stdio transport for command-line integration

## Architecture

### Core Components

**StagehandMCPServer** (`src/stagehand-server.ts`):

- Main MCP server implementation that wraps Stagehand functionality
- Manages Stagehand instance lifecycle with lazy initialization
- Handles cleanup and error management
- Exposes 5 core tools: navigate, act, extract, observe, screenshot

**Transport Layer**:

- `src/index.ts` - stdio transport entry point with CLI argument parsing and graceful shutdown

**Type Definitions** (`src/types.ts`):

- Zod schemas with detailed descriptions for input validation of all tools
- TypeScript type definitions for all tool inputs
- Support for optional parameters with sensible defaults

### MCP Tools Exposed

1. **navigate** - Navigate to URLs
2. **act** - Perform actions using natural language (click, type, etc.)
3. **extract** - Extract structured data from pages
4. **observe** - Get information about actionable elements on the page
5. **screenshot** - Capture page screenshots (returns base64 or saves to file)

### Environment Configuration

The server is configured to use LOCAL mode with a local browser installation.

**Default Configuration:**

- Model: `openai/gpt-4.1-mini`
- Browser: Google Chrome (macOS path)
- Headless: `false` (visual browser window)
- API Key: `OPENAI_API_KEY` environment variable

**CLI Override Options:**

- `--modelName` - Change the AI model
- `--modelApiKey` - Override API key
- `--executablePath` - Use different browser executable
- `--headless` - Run in headless mode

## Code Style and Configuration

- **TypeScript**: Configured for ES2022 with strict mode enabled
- **Module System**: ESNext modules with .js extensions in imports
- **Build Target**: dist/ directory with source maps and declarations
- **Prettier**: 4-space tabs, single quotes, no semicolons, 120 character line width
- **Error Handling**: Tools throw errors on failure, handled by MCP framework

## Important Implementation Details

- Stagehand instance is lazily initialized on first tool call
- Browser cleanup is handled automatically on process termination
- All tool arguments are validated using Zod schemas
- Screenshots can be returned as base64 data or saved to specified paths
- The server maintains a single Stagehand instance for the entire process lifecycle
- JSON schema support for structured data extraction with automatic Zod conversion
