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

This node uses a Resource/Operation structure for organization and extensibility.

### Resources

#### Trades
Manage trades for your AlphaInsider strategies.

**Operations:**

- **New Order Allocations**: Send multiple position allocations to your AlphaInsider strategies in a single request. Perfect for portfolio rebalancing or executing multi-asset trading signals.

**Parameters:**
- **Strategy**: Select from your account strategies (dynamically loaded)
- **Allocations**: JSON array of allocation objects. Each allocation should have:
  - **stock_id**: Format as `SYMBOL:EXCHANGE` (e.g., `AAPL:NASDAQ`, `BTC:COINBASE`).
  - **action**: `long`, `short`, or `close`
  - **percent**: Percentage of buying power to allocate (0 <= x <= 2, where values >1 use leverage). Sum of all allocations cannot exceed 2 (200%). Required field
- **Slippage**: Percentage offset from current bid/ask price for limit orders (0 <= x <= 0.05, optional, defaults to 0.002). Helps ensure orders fill by accounting for price movements

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
2. Select **Trades** as the resource
3. Select **New Order Allocations** as the operation
4. Choose your strategy from the dropdown
5. Enter your allocations as a JSON array, for example:
   ```json
   [
     {"stock_id": "AAPL:NASDAQ", "action": "long", "percent": 1},
     {"stock_id": "TSLA:NASDAQ", "action": "long", "percent": 0.6},
     {"stock_id": "SPY:NYSE", "action": "short", "percent": 0.4}
   ]
   ```
6. Optionally adjust slippage (0 <= x <= 0.05, defaults to 0.002)
7. Connect your trigger (e.g., webhook, schedule, or another node)

### Example: Portfolio Rebalancing

To allocate 100% to AAPL long, 60% to TSLA long, and 40% to SPY short, equating to full 200% or 2x leverage, use this JSON array:
```json
[
  {"stock_id": "AAPL:NASDAQ", "action": "long", "percent": 1},
  {"stock_id": "TSLA:NASDAQ", "action": "long", "percent": 0.6},
  {"stock_id": "SPY:NYSE", "action": "short", "percent": 0.4}
]
```

### Tips

- **Strategy Dropdown**: The strategy list is automatically loaded from your AlphaInsider account. If you don't see your strategies, verify your API credentials are correctly configured.

- **Stock ID Format**: Use `SYMBOL:EXCHANGE` format:
  - Stocks: `AAPL:NASDAQ`, `TSLA:NASDAQ`
  - Crypto: `BTC:COINBASE`, `ETH:COINBASE`

- **Percent Allocation**: The percent field (0 <= x <= 2) determines what portion of your strategy's buying power to use for each allocation, including leverage. This field is required. For example:
  - `0.5` = 50% of buying power (no leverage)
  - `1` = 100% of buying power (no leverage)
  - `1.5` = 150% of buying power (1.5x leverage)
  - `2` = 200% of buying power
  - The sum of all allocation percents cannot exceed 2 (200%)

- **Multiple Allocations**: You can include as many allocations as needed in the JSON array. This is ideal for portfolio rebalancing or executing complex multi-asset strategies. You can also pass JSON arrays from other n8n nodes as parameters.

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
