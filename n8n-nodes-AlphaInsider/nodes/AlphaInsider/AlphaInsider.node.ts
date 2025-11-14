import {
    INodeType,
    INodeTypeDescription,
    NodeConnectionType,
} from 'n8n-workflow';

export class AlphaInsider implements INodeType { // Ensure this matches the constructor call.
    description: INodeTypeDescription = {
        displayName: 'AlphaInsider',
        name: 'alphaInsider',
        icon: 'file:alphaLogo.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Open Marketplace for Trading Strategies. Follow top crypto & stock strategies in real-time. Automate trades by connecting your broker or exchange. Split capital across multiple strategies.',
        defaults: {
            name: 'AlphaInsider',
        },
        inputs: ['main' as NodeConnectionType],
        outputs: ['main' as NodeConnectionType],
        credentials: [
            {
                name: 'AlphaInsiderApi', // Ensure this matches the credentials class name.
                required: true,
            },
        ],
        requestDefaults: {
            baseURL: 'https://alphainsider.com/api',
            headers: {
                'Content-Type': 'application/json',
            },
        },
        properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'New Order Webhook',
                        value: 'newOrderWebhook',
                    },
                ],
                default: 'newOrderWebhook',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['newOrderWebhook'],
                    },
                },
                options: [
                    {
                        name: 'Create',
                        value: 'create',
                        action: 'Create a new webhook order',
                        description: 'New order from webhook.',
                        routing: {
                            request: {
                                method: 'POST',
                                url: '/newOrderWebhook',
                                body: {
                                    strategy_id: '={{$parameter.strategy_id}}',
                                    stock_id: '={{$parameter.stock_id}}',
                                    action: '={{$parameter.action}}',
                                    api_token: '={{$credentials.AlphaInsiderApi.apiKey}}',
                                    ...{
                                        leverage: '={{Math.round($parameter.leverage * 100) / 100}}',
                                    },
                                },
                            },
                        },
                    },
                ],
                default: 'create',
            },
            {
                displayName: 'Strategy ID',
                name: 'strategy_id',
                type: 'string',
                default: '',
                required: true,
                description: 'The id of the strategy.',
            },
            {
                displayName: 'Stock ID',
                name: 'stock_id',
                type: 'string',
                default: '',
                required: true,
                description: 'The id of the stock: "stock:exchange" or "stock_id". Ex: AAPL:NASDAQ.',
            },
            {
                displayName: 'Action',
                name: 'action',
                type: 'options',
                default: '',
                required: true,
                options: [
                    { name: 'Buy', value: 'buy' },
                    { name: 'Long', value: 'long' },
                    { name: 'Sell', value: 'sell' },
                    { name: 'Short', value: 'short' },
                    { name: 'Close', value: 'close' },
                    { name: 'Flat', value: 'flat' },
                ],
                description: 'Order actions.',
            },
            {
                displayName: 'Leverage',
                name: 'leverage',
                type: 'number',
                default: 1.5,
                description: 'Leverage to trade at.',
                typeOptions: {
                    minValue: 0,
                    maxValue: 2,
                },
            },
        ],
    };
}