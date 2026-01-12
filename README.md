# n8n-nodes-alphainsider

This is an n8n community node that lets you integrate [AlphaInsider](https://alphainsider.com) with your n8n workflows.

AlphaInsider is an open marketplace for trading strategies where you can follow top crypto & stock strategies in real-time, automate trades by connecting your broker or exchange, and split capital across multiple strategies.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Table of Contents

- [Quick Start](#quick-start)
- [Build](#build)
- [Publish](#publish)
- [Functionality](#functionality)
- [Credentials](#credentials)
- [Resources](#resources)

## Quick Start

### Prerequisites

- Node.js version 18.0.0 or higher
- npm or yarn package manager
- An n8n instance (self-hosted or cloud)
- AlphaInsider account with API access

### Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

**In n8n:**

1. Go to **Settings** → **Community Nodes**
2. Select **Install**
3. Enter `@alphainsiderinc/n8n-nodes-alphainsider`
4. Click **Install**

**Via npm (for self-hosted n8n):**

```bash
npm install @alphainsiderinc/n8n-nodes-alphainsider
```

### Setup

1. **Get your API Key**: Visit your [AlphaInsider Developer Settings](https://alphainsider.com/settings/developers) and generate an API key with the required permissions (webhooks → newOrderWebhook)
2. **Add Credentials in n8n**:
   - In n8n, go to **Credentials** → **New**
   - Search for "AlphaInsider API"
   - Enter your API key
   - Test the connection
3. **Use the Node**: Add the AlphaInsider node to your workflow and start automating!

## Build

This section is for developers who want to modify or contribute to the node.

### Development Setup

1. **Clone the repository**:
```bash
git clone https://github.com/AlphaInsider/n8n-nodes-alphainsider.git
cd n8n-nodes-alphainsider
```

2. **Install dependencies**:
```bash
npm install
```

3. **Build the project**:
```bash
npm run build
```

This command:
- Cleans the `dist/` folder
- Compiles TypeScript to JavaScript
- Copies the AlphaInsider logo SVG to the distribution folder

### Project Structure

```
n8n-nodes-alphainsider/
├── nodes/
│   └── AlphaInsider/
│       ├── AlphaInsider.node.ts    # Main node implementation
│       ├── AlphaInsider.node.json  # Node metadata
│       └── alphaLogo.svg           # Node icon
├── credentials/
│   └── AlphaInsiderApi.credentials.ts  # API credential definition
├── dist/                           # Compiled output (generated)
├── package.json                    # Package configuration
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript and prepare for distribution |
| `npm run clean` | Remove the dist folder |

## Publish

This section is for maintainers publishing updates to npm.

### Pre-Publish Checklist

1. **Update version** in `package.json`:
```bash
npm version patch  # for bug fixes
npm version minor  # for new features
npm version major  # for breaking changes
```

2. **Ensure all tests pass** and the build succeeds:
```bash
npm run build
```

3. **Commit and tag** your changes:
```bash
git add .
git commit -m "Release v1.0.x"
git push origin master
git push --tags
```

4. **Publish to npm**:
```bash
npm publish
```

### Publishing to n8n Community

After publishing to npm, your node will be available in the n8n community nodes directory. Users can install it directly from within n8n.

For verified status on n8n Cloud, submit your node through the [n8n Creator Portal](https://creators.n8n.io/nodes).

## Functionality

The AlphaInsider n8n node provides two main resources for interacting with the AlphaInsider API:

### 1. New Order Webhook

Create trading orders on AlphaInsider via webhook integration. This is ideal for automating trading strategies triggered by external signals (e.g., TradingView alerts, custom algorithms, or other n8n workflows).

**Operation**: Create

**Parameters**:
- **Strategy ID** (required): The unique identifier of your AlphaInsider strategy
- **Stock ID** (required): The trading symbol in format `SYMBOL:EXCHANGE` (e.g., `AAPL:NASDAQ`) or a stock ID
- **Action** (required): The order action to execute:
  - `buy` - Open a long position
  - `long` - Open a long position
  - `sell` - Close a long position or open a short
  - `short` - Open a short position
  - `close` - Close the current position
  - `flat` - Close all positions
- **Leverage** (optional): Trading leverage between 0 and 2 (default: 1.5)

**Example Use Case**:
```
TradingView Alert → Webhook → n8n → AlphaInsider Node → Execute Trade
```

**API Endpoint**: `POST https://alphainsider.com/api/newOrderWebhook`

**Request Body**:
```json
{
  "strategy_id": "your-strategy-id",
  "stock_id": "AAPL:NASDAQ",
  "action": "buy",
  "leverage": 1.5,
  "api_token": "your-api-key"
}
```

### 2. Custom API Call

Make flexible HTTP requests to any AlphaInsider API endpoint. This resource provides full control over the request method, endpoint path, query parameters, headers, and body.

**Operation**: Execute

**Parameters**:
- **HTTP Method** (required): GET or POST
- **Has Authentication** (required): Whether to include API key in Authorization header (default: true)
- **Endpoint** (required): API endpoint path starting with `/` (e.g., `/getUserInfo`)
- **Query Parameters** (optional): Query string parameters as JSON object (e.g., `{"page": 1, "limit": 50}`)
- **Body** (optional): Request body as JSON object (leave `{}` for no body)

**Example Use Cases**:
- Fetch user information: `GET /getUserInfo`
- Retrieve strategy details: `GET /getStrategy?strategy_id=123`
- Update strategy settings: `POST /updateStrategy`

**API Base URL**: `https://alphainsider.com/api`

**Authentication**:
When "Has Authentication" is enabled, the node automatically includes your API key in the Authorization header:
```
Authorization: your-api-key
```

### How It Works (Technical Implementation)

The AlphaInsider node is built using n8n's **declarative routing style**, which means:

1. **No Custom Execute Method**: Instead of writing custom code to make HTTP requests, the node uses declarative `routing` configurations that n8n handles automatically.

2. **Dynamic Request Building**: Based on user-selected parameters, the node dynamically constructs API requests:
   - For "New Order Webhook": Builds a POST request with trading parameters
   - For "Custom API Call": Builds a flexible request based on user inputs

3. **Credential Integration**: The node seamlessly integrates with n8n's credential system:
   - API key is securely stored and referenced via `={{$credentials.AlphaInsiderApi.apiKey}}`
   - Credentials are validated on save using a test request to `/getUserInfo`

4. **Expression Support**: All parameters support n8n expressions (indicated by `={{...}}`), allowing dynamic values from:
   - Previous node outputs
   - Workflow variables
   - JavaScript expressions
   - Built-in functions

5. **Conditional UI**: The node uses `displayOptions` to show/hide parameters based on the selected resource and operation, providing a clean, context-aware interface.

**Key Code Structure** (from `AlphaInsider.node.ts`):
```typescript
// Base configuration
requestDefaults: {
  baseURL: 'https://alphainsider.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
}

// Resource selection
properties: [
  {
    displayName: 'Resource',
    options: ['New Order Webhook', 'Custom API Call']
  }
]

// Declarative routing for New Order Webhook
routing: {
  request: {
    method: 'POST',
    url: '/newOrderWebhook',
    body: {
      strategy_id: '={{$parameter.strategy_id}}',
      stock_id: '={{$parameter.stock_id}}',
      action: '={{$parameter.action}}',
      api_token: '={{$credentials.AlphaInsiderApi.apiKey}}',
      leverage: '={{Math.round($parameter.leverage * 100) / 100}}'
    }
  }
}
```

This approach makes the node maintainable, type-safe, and consistent with n8n best practices.

## Credentials

### Setting Up AlphaInsider API Credentials

1. **Generate an API Key**:
   - Log in to [AlphaInsider](https://alphainsider.com)
   - Navigate to [Settings → Developers](https://alphainsider.com/settings/developers)
   - Click "Generate New API Key"
   - Set the required permissions: **webhooks → newOrderWebhook**
   - Copy your API key securely

2. **Add Credentials in n8n**:
   - In your n8n instance, go to **Credentials** → **New Credential**
   - Search for "AlphaInsider API"
   - Paste your API key in the "API Key" field
   - Click "Save" (n8n will automatically test the connection)

3. **Test Your Credentials**:
   - The credential test makes a GET request to `/getUserInfo`
   - If successful, your credentials are properly configured
   - If it fails, verify your API key and permissions

### Required Permissions

Your AlphaInsider API key needs the following permissions:
- **webhooks → newOrderWebhook**: To create orders via webhook

### Security Notes

- API keys are encrypted and stored securely by n8n
- Never commit API keys to version control
- Rotate your API keys periodically
- Use separate API keys for development and production

## Resources

- **[AlphaInsider Platform](https://alphainsider.com)** - Open marketplace for trading strategies
- **[AlphaInsider API Documentation](https://api.alphainsider.com/resources/webhooks/neworderwebhook)** - Complete API reference
- **[AlphaInsider Developer Settings](https://alphainsider.com/settings/developers)** - Generate and manage API keys
- **[n8n Documentation](https://docs.n8n.io/)** - Learn more about n8n
- **[n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)** - Installation and usage guide
- **[GitHub Repository](https://github.com/AlphaInsider/n8n-nodes-alphainsider)** - Source code and issues
- **[npm Package](https://www.npmjs.com/package/@alphainsiderinc/n8n-nodes-alphainsider)** - Published package

## Support

For issues, questions, or feature requests:
- **GitHub Issues**: [Report an issue](https://github.com/AlphaInsider/n8n-nodes-alphainsider/issues)
- **Support**: Submit a [Support ticket](https://alphainsider.com/contact)
- **AlphaInsider Community**: Join discussions on the AlphaInsider platform

## License

[MIT](LICENSE.md)

---

**Version**: 1.0.0
**Author**: AlphaInsider
**Repository**: https://github.com/AlphaInsider/n8n-nodes-alphainsider
