# Stagehand MCP Server

An MCP (Model Context Protocol) server that exposes [Stagehand](https://github.com/browserbase/stagehand) browser automation capabilities to Claude and other MCP clients.

## Features

- **Browser Automation**: Navigate, click, type, and interact with web pages using natural language
- **Data Extraction**: Extract structured information from any webpage
- **Screenshots**: Capture page screenshots as base64 or save to files
- **Local Browser**: Uses your local Chrome/Chromium installation
- **AI-Powered**: Leverages OpenAI models for intelligent web interactions

## Installation

### MCP Configuration

Add to your MCP client configuration:

```json
{
    "mcpServers": {
        "stagehand": {
            "command": "npx",
            "args": ["stagehand-mcp"],
            "env": {
                "OPENAI_API_KEY": "your-openai-api-key"
            }
        }
    }
}
```

### Arguments

- `--modelName` - Override the default model (default: "openai/gpt-4.1-mini")
- `--modelApiKey` - Override the API key (default: OPENAI_API_KEY env var)
- `--executablePath` - Override browser executable path
- `--headless` - Run in headless mode
- `--cdpUrl` - Connect to an existing browser instance via Chrome DevTools Protocol URL

### Development

```bash
npm run dev        # Watch mode for development
npm run inspector  # Launch MCP Inspector for testing
```

## Tools

The server provides 5 core automation tools:

1. **navigate** - Navigate to URLs
2. **act** - Perform actions using natural language (click, type, etc.)
3. **extract** - Extract structured data from pages
4. **observe** - Get information about actionable elements
5. **screenshot** - Capture page screenshots

### Extract Tool Usage

The `extract` tool can extract structured data from web pages using natural language instructions. You can optionally provide a JSON schema to specify the exact structure you want.

#### Basic Usage

```
Extract all product names and prices from this page
```

#### Schema-based Extraction

For structured data extraction, provide a JSON schema:

```json
{
  "instruction": "extract product information",
  "schema": {
    "type": "object",
    "properties": {
      "products": {
        "type": "array",
        "items": {
          "type": "object", 
          "properties": {
            "name": { "type": "string" },
            "price": { "type": "string" },
            "url": { 
              "type": "string",
              "format": "uri"
            }
          }
        }
      }
    }
  }
}
```

#### Supported Schema Types

- **string** - Text data
- **string** with **format: "uri"** or **format: "url"** - URLs/links (validates as proper URLs)
- **number** - Numeric values
- **boolean** - True/false values
- **array** - Lists of items
- **object** - Nested structures

#### URL/Link Extraction

To extract URLs or links, use the `format: "uri"` specification:

```json
{
  "type": "object",
  "properties": {
    "contactLink": {
      "type": "string",
      "format": "uri"
    }
  }
}
```

This ensures the extracted value is validated as a proper URL format.

## License

MIT
