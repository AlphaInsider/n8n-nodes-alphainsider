import type { INodeProperties } from 'n8n-workflow';

const showOnlyForNewOrderAllocations = {
	operation: ['newOrderAllocations'],
	resource: ['trades'],
};

export const newOrderAllocationsDescription: INodeProperties[] = [
	{
		displayName: 'Strategy',
		name: 'strategy_id',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getUserStrategies'
		},
		default: '',
		required: true,
		description: 'Select a strategy from your AlphaInsider account.',
		displayOptions: {
			show: showOnlyForNewOrderAllocations
		}
	},
	{
		displayName: 'Allocations',
		name: 'allocations',
		type: 'string',
		default: '[]',
		description: 'JSON array of strategy allocations. Each allocation object should have: stock_id (string), action (long/short/close), and percent (0-2, represents percentage of buying power including leverage).',
		placeholder: 'Add allocation JSON string',
		hint: '[{"stock_id":"AAPL:NASDAQ","action":"long","percent":1.5}]',
		required: true,
		displayOptions: {
			show: showOnlyForNewOrderAllocations
		}
	},
	{
		displayName: 'Slippage',
		name: 'slippage',
		type: 'number',
		default: 0.002,
		description: 'Percentage offset from current bid/ask price when placing limit orders (0-0.05). Helps ensure orders fill by accounting for potential price movements.',
		typeOptions: {
			minValue: 0,
			maxValue: 0.05,
			numberPrecision: 3
		},
		displayOptions: {
			show: showOnlyForNewOrderAllocations
		}
	}
];
