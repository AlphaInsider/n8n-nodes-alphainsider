import type { INodeProperties } from 'n8n-workflow';
import { websocketsTriggerDescription } from './websocketsTrigger';

const showOnlyForWebsockets = {
	resource: ['websockets'],
};

export const websocketsDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForWebsockets,
		},
		options: [
			{
				name: 'Subscribe',
				value: 'subscribe',
				action: 'Subscribe to websocket channels',
				description: 'Subscribe to real-time websocket events from AlphaInsider'
			}
		],
		default: 'subscribe',
	},
	...websocketsTriggerDescription,
];
