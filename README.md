# n8n-nodes-alphainsider

This is an n8n community node package that provides:

- **AlphaInsider** trigger node with selectable actions (including websocket triggers)
- **AlphaInsider API** credentials used by the trigger

[Installation](#installation)
[Credentials](#credentials)
[Usage](#usage)
[Resources](#resources)
[Support](#support)

## Installation

Follow the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

## Credentials

1. Log in to [AlphaInsider](https://alphainsider.com).
2. Open [Settings -> Developers](https://alphainsider.com/settings/developers).
3. Generate an API key.
4. In n8n, create **AlphaInsider API** credentials and paste your API key.

n8n validates credentials with a `POST https://alphainsider.com/api/verifyToken` request.

## Usage

Use the **AlphaInsider** trigger node to subscribe to realtime updates from `wss://alphainsider.com/ws`.

1. Add **AlphaInsider** to your workflow.
2. Select your **AlphaInsider API** credentials.
3. Choose **Action Sub-Label** = `Websockets`.
4. Choose **Action** = `Trigger`.
5. Enter channels (comma-separated or newline-separated).
6. Activate the workflow.

### Subscription Payload

```json
{
  "event": "subscribe",
  "payload": {
    "channels": ["wsOrders:<STRATEGY_ID>"],
    "token": "<YOUR_API_KEY>"
  }
}
```

### Channel Examples

- `wsStockPrice:AAPL:NASDAQ`
- `wsStrategyValue:<STRATEGY_ID>`
- `wsOrders:<STRATEGY_ID>`
- `wsPositions:<STRATEGY_ID>`
- `wsTimelines:<STRATEGY_ID>`
- `wsBotStatus:<BOT_ID>`
- `wsBotAllocations:<BOT_ID>`
- `wsBotActivities:<BOT_ID>`

### Notes

- Enable **Emit Lifecycle Events** for connection/subscription diagnostics.
- Enable **Debug Logging** to add websocket diagnostics to n8n logs.
- Control events (for example `subscribe`, `error`, `connected`) are not emitted as data items.
- Only `ws...` data events for subscribed channels are emitted.
- In manual/test mode, lifecycle events are suppressed to avoid early completion.

## Resources

- [AlphaInsider Platform](https://alphainsider.com)
- [AlphaInsider API Docs](https://api.alphainsider.com)
- [AlphaInsider Websocket Docs](https://api.alphainsider.com/resources/websockets)
- [n8n Docs](https://docs.n8n.io/)

## Support

- [GitHub Issues](https://github.com/AlphaInsider/n8n-nodes-alphainsider/issues)
- [AlphaInsider Support](https://alphainsider.com/contact)
