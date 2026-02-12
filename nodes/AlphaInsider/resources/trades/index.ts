import type { INodeProperties } from 'n8n-workflow';
import { newOrderAllocationsDescription } from './newOrderAllocations';

const showOnlyForTrades = {
	resource: ['trades'],
};

export const tradesDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForTrades,
		},
		options: [
			{
				name: 'New Order Allocations',
				value: 'newOrderAllocations',
				action: 'Create new order allocations',
				description: 'Create new orders for a given strategy to match the allocations list.'
			}
		],
		default: 'newOrderAllocations',
	},
	...newOrderAllocationsDescription,
];
