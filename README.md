# n8n-nodes-alphainsider

This is an n8n community node. It lets you use [AlphaInsider](https://alphainsider.com) with your n8n workflows.

AlphaInsider is an open marketplace for trading strategies where you can follow top crypto & stock strategies in real-time, automate trades by connecting your broker or exchange, and split capital across multiple strategies.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Usage](#usage)  
[Resources](#resources)  
[Support](#support)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.  

## Operations

This node supports two main resources:

### New Order Webhook
- **Create**: Send webhook orders to your AlphaInsider strategies
  - Select a strategy from your account (dynamically loaded)
  - Specify stock ID (e.g., `AAPL:NASDAQ`)
  - Choose action: Buy, Sell, Long, Short, Close, or Flat
  - Set leverage (0-2x)

### Custom API Call
- **Create**: Make custom API calls to any AlphaInsider endpoint
  - Choose HTTP method (GET or POST)
  - Specify endpoint path
  - Add query parameters and request body as JSON
  - Optional authentication support

## Credentials

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

## Usage

### Choosing the Right Resource

- **New Order Webhook**: Use this when you want to send trading signals to your AlphaInsider strategies. This is the most common use case for automated trading workflows.

- **Custom API Call**: Use this for advanced scenarios or endpoints not covered by the New Order Webhook resource. Refer to the [AlphaInsider API documentation](https://api.alphainsider.com) for available endpoints.

### Tips

- The **Strategy** dropdown automatically loads all strategies from your AlphaInsider account. If you don't see your strategies, verify your API credentials have the `strategies → getUserStrategies` or `webhooks → newOrderWebhook` permission.

- For stock IDs, use the format `SYMBOL:EXCHANGE` (e.g., `AAPL:NASDAQ`, `TSLA:NASDAQ`, `BTC:CRYPTO`).

- New to n8n? Check out the [Try it out](https://docs.n8n.io/try-it-out/) documentation to get started with workflows.

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