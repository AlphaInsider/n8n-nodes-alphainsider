import {
	INodeType,
	INodeTypeDescription,
	ITriggerFunctions,
	ITriggerResponse,
	NodeConnectionTypes
} from 'n8n-workflow';
import { router } from './helpers';
import { websocketsDescription } from './resources/websockets';

export class AlphaInsider implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AlphaInsider',
		name: 'alphaInsider',
		icon: 'file:logo.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Real-time stock & crypto data, automated trading, live trade alerts, broker connections.',
		defaults: {
			name: 'AlphaInsider'
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'AlphaInsiderApi',
				required: true
			}
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Websockets',
						value: 'websockets',
					}
				],
				default: 'websockets',
			},
			...websocketsDescription,
		]
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		return router(this);
	}
}
