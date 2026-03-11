import {
	ITriggerFunctions,
	ITriggerResponse,
	NodeOperationError
} from 'n8n-workflow';
import { executeWebsocketsTrigger } from './resources/websockets/websocketsTrigger';

export async function router(context: ITriggerFunctions): Promise<ITriggerResponse> {
	const resource = context.getNodeParameter('resource', 'websockets') as string;

	switch (resource) {
		case 'websockets':
			return executeWebsocketsTrigger(context);
		default:
			throw new NodeOperationError(context.getNode(), `Unsupported resource "${resource}"`);
	}
}
