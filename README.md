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

### New Order Allocations
Send multiple position allocations to your AlphaInsider strategies in a single request. Perfect for portfolio rebalancing or executing multi-asset trading signals.

**Parameters:**
- **Strategy**: Select from your account strategies (dynamically loaded)
- **Allocations**: Array of allocation objects (add multiple), each containing:
  - **Stock ID**: Format as `SYMBOL:EXCHANGE` (e.g., `AAPL:NASDAQ`, `BTC:COINBASE`)
  - **Action**: Buy, Sell, Long, Short, Close, or Flat
  - **Percent**: Percentage of strategy buying power to allocate (0 <= x <= 1, defaults to 1)
- **Leverage**: Set trading leverage (0 <= x < 2, defaults to 1).  **WARNING:** 2x leverage orders may fail if prices move; use less than 1.95x for reliable fills

### Custom API Calls
For custom API calls to other AlphaInsider endpoints, use n8n's built-in **HTTP Request node** with your AlphaInsider API credential. Your credentials will be available in the HTTP Request node under **Authentication** → **Predefined Credential Type** → **AlphaInsider API**.

## Credentials

### Setting Up Your API Key

1. **Generate an API Key**:
   - Log in to [AlphaInsider](https://alphainsider.com)
   - Navigate to [Settings → Developers](https://alphainsider.com/settings/developers)
   - Click "Generate New API Key"
   - Set the required permissions: **trades → newOrderAllocations**, **users → getUserInfo**, **strategies → getUserStrategies**
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
2. Select **New Order Allocations** action
3. Choose your strategy from the dropdown
4. Click **Add Allocation** to create one or more allocations:
   - Enter the stock ID (e.g., `AAPL:NASDAQ`)
   - Select the action (Buy, Sell, Long, Short, Close, or Flat)
   - Set the percent of strategy buying power to allocate (0 <= x <= 1, defaults to 1 = 100%)
5. Adjust the leverage (0 <= x < 2,defaults to 1)
6. Connect your trigger (e.g., webhook, schedule, or another node)

### Example: Portfolio Rebalancing

To allocate 50% to AAPL long, 30% to TSLA long, and 20% to BTC long:
1. Add **Allocation 1**: Stock ID = `AAPL:NASDAQ`, Action = `Long`, Percent = `0.5`
2. Add **Allocation 2**: Stock ID = `TSLA:NASDAQ`, Action = `Long`, Percent = `0.3`
3. Add **Allocation 3**: Stock ID = `BTC:CRYPTO`, Action = `Long`, Percent = `0.2`

### Tips

- **Strategy Dropdown**: The strategy list is automatically loaded from your AlphaInsider account. If you don't see your strategies, verify your API credentials are correctly configured.

- **Stock ID Format**: Use `SYMBOL:EXCHANGE` format:
  - Stocks: `AAPL:NASDAQ`, `TSLA:NASDAQ`
  - Crypto: `BTC:CRYPTO`, `ETH:CRYPTO`

- **Percent Allocation**: The percent field (0 <= x <= 1) determines what portion of your strategy's buying power to use for each allocation. If omitted, defaults to 1 (100%). For example:
  - `0.5` = 50% of buying power
  - `0.25` = 25% of buying power
  - `1` = 100% of buying power

- **Multiple Allocations**: You can add as many allocations as needed in a single node execution. This is ideal for portfolio rebalancing or executing complex multi-asset strategies.

- **Custom API Calls**: Use the HTTP Request node with your AlphaInsider API credential for any endpoints not covered by the New Order Allocations operation. See [AlphaInsider API documentation](https://api.alphainsider.com) for available endpoints.

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
