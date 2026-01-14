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

### New Order Webhook
Send trading signals to your AlphaInsider strategies through webhook orders.

**Parameters:**
- **Strategy**: Select from your account strategies (dynamically loaded)
- **Stock ID**: Format as `SYMBOL:EXCHANGE` (e.g., `AAPL:NASDAQ`, `BTC:CRYPTO`)
- **Order Action**: Buy, Sell, Long, Short, Close, or Flat
- **Leverage**: Set trading leverage (0-2x, rounded to 2 decimal places)

### Custom API Calls
For custom API calls to other AlphaInsider endpoints, use n8n's built-in **HTTP Request node** with your AlphaInsider API credential. Your credentials will be available in the HTTP Request node under **Authentication** → **Predefined Credential Type** → **AlphaInsider API**.

## Credentials

### Setting Up Your API Key

1. **Generate an API Key**:
   - Log in to [AlphaInsider](https://alphainsider.com)
   - Navigate to [Settings → Developers](https://alphainsider.com/settings/developers)
   - Click "Generate New API Key"
   - Set the required permissions: **webhooks → newOrderWebhook**
   - Copy your API key securely

2. **Add Credentials in n8n**:
   - In your n8n instance, go to **Credentials** → **New Credential**
   - Search for "AlphaInsider API"
   - **TIP**: Update the "Credential name" field at the top with a descriptive name (e.g., "AlphaInsider - john@example.com") to easily identify which account you're using
   - Paste your API key in the "API Key" field
   - Click "Save" (n8n will automatically test the connection)

3. **Test Your Credentials**:
   - The credential test makes a GET request to `/getUserInfo`
   - If successful, your credentials are properly configured
   - If it fails, verify your API key and permissions

## Usage

### Basic Workflow Example

1. Add the **AlphaInsider** node to your workflow
2. Select **New Order Webhook** action
3. Choose your strategy from the dropdown
4. Configure stock ID, order action, and leverage
5. Connect your trigger (e.g., webhook, schedule, or another node)

### Tips

- **Strategy Dropdown**: The strategy list is automatically loaded from your AlphaInsider account. If you don't see your strategies, verify your API credentials are correctly configured.

- **Stock ID Format**: Use `SYMBOL:EXCHANGE` format:
  - Stocks: `AAPL:NASDAQ`, `TSLA:NASDAQ`
  - Crypto: `BTC:CRYPTO`, `ETH:CRYPTO`

- **Custom API Calls**: Use the HTTP Request node with your AlphaInsider API credential for any endpoints not covered by the New Order Webhook operation. See [AlphaInsider API documentation](https://api.alphainsider.com) for available endpoints.

- **Multiple Accounts**: You can create multiple AlphaInsider API credentials for different accounts. Name them descriptively to keep track of which account each credential belongs to.

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
