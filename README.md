# n8n-nodes-alphainsider

This is an n8n community node. It provides [AlphaInsider](https://alphainsider.com) authentication for use with n8n's HTTP Request node.

AlphaInsider is an open marketplace for trading strategies where you can follow top crypto & stock strategies in real-time, automate trades by connecting your broker or exchange, and split capital across multiple strategies.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Credentials](#credentials)
[Usage](#usage)
[Resources](#resources)
[Support](#support)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Credentials

### Setting Up Your API Key

1. **Generate an API Key**:
   - Log in to [AlphaInsider](https://alphainsider.com)
   - Navigate to [Settings → Developers](https://alphainsider.com/settings/developers)
   - Click "Generate New API Key"
   - Click the **n8n/make/zapier** button to get the permissions needed for the API key
   - Copy your API key securely

2. **Add Credentials in n8n**:
   - In your n8n instance, go to **Credentials** → **New Credential**
   - Search for "AlphaInsider API"
   - **TIP**: Update the "Credential name" field at the top with a descriptive name (e.g., "AlphaInsider - john@example.com") to easily identify which account you're using
   - Paste your API key in the "API Key" field
   - Click "Save" (n8n will automatically test the connection)

3. **Test Your Credentials**:
   - The credential test makes a POST request to `/verifyToken` with the API key passed in the body.
   - If successful, your credentials are properly configured
   - If it fails, verify your API key and permissions

## Usage

This node provides authentication credentials for the AlphaInsider API. Use it with n8n's **HTTP Request** node to make authenticated requests to any AlphaInsider API endpoint.

### Basic Workflow Example

1. Add an **HTTP Request** node to your workflow
2. In the **Authentication** section, select **Predefined Credential Type**
3. Choose **AlphaInsider API** from the credential type dropdown
4. Select your configured AlphaInsider credential
5. Configure your HTTP request:
   - **Method**: Choose the appropriate HTTP method (GET, POST, etc.)
   - **URL**: Enter the full AlphaInsider API endpoint (e.g., `https://alphainsider.com/api/newOrderAllocations`)
   - **Body**: Add any required request body data as JSON

### Example: Creating Order Allocations

Using the HTTP Request node with AlphaInsider authentication:

**Configuration:**
- **Method**: POST
- **URL**: `https://alphainsider.com/api/newOrderAllocations`
- **Authentication**: AlphaInsider API (select your credential)
- **Body Content Type**: JSON
- **Body**:
```json
{
  "strategy_id": "your-strategy-id",
  "allocations": [
    {"stock_id": "AAPL:NASDAQ", "action": "long", "percent": 1},
    {"stock_id": "TSLA:NASDAQ", "action": "long", "percent": 0.6},
    {"stock_id": "SPY:NYSE", "action": "short", "percent": 0.4}
  ],
  "slippage": 0.002
}
```

### Tips

- **Multiple Accounts**: You can create multiple AlphaInsider API credentials for different accounts. Name them descriptively to keep track of which account each credential belongs to.

- **API Endpoints**: Refer to the [AlphaInsider API Documentation](https://api.alphainsider.com) for available endpoints and request/response formats.

- **New to n8n?** Check out the [Try it out](https://docs.n8n.io/try-it-out/) documentation to get started with workflows.

## Resources

- **[AlphaInsider Platform](https://alphainsider.com)** - Open marketplace for trading strategies
- **[AlphaInsider API Documentation](https://api.alphainsider.com)** - Complete API reference
- **[AlphaInsider Developer Settings](https://alphainsider.com/settings/developers)** - Generate and manage API keys
- **[n8n Documentation](https://docs.n8n.io/)** - Learn more about n8n
- **[n8n Community Nodes](https://docs.n8n.io/integrations/#community-nodes)** - Installation and usage guide

## Support

For issues, questions, or feature requests:
- **GitHub Issues**: [Report an issue](https://github.com/AlphaInsider/n8n-nodes-alphainsider/issues)
- **Support**: Submit a [Support ticket](https://alphainsider.com/contact)
