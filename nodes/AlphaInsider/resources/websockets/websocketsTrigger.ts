import {
	IDataObject,
	INodeProperties,
	ITriggerFunctions,
	ITriggerResponse,
	NodeOperationError,
	sleep
} from 'n8n-workflow';

const ALPHA_INSIDER_WEBSOCKET_URL = 'wss://alphainsider.com/ws';

const showOnlyForWebsockets = {
	resource: ['websockets']
};

export const websocketsTriggerDescription: INodeProperties[] = [
	{
		displayName: 'Channels',
		name: 'channels',
		type: 'string',
		default: '',
		required: true,
		typeOptions: {
			rows: 4
		},
		displayOptions: {
			show: showOnlyForWebsockets
		},
		placeholder: 'wsOrders:strategy_id\nwsStockPrice:AAPL:NASDAQ',
		description: 'Comma-separated or newline-separated websocket channels to subscribe to'
	},
	{
		displayName: 'Reconnect',
		name: 'reconnect',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: showOnlyForWebsockets
		},
		description: 'Whether to reconnect automatically if the websocket disconnects'
	},
	{
		displayName: 'Reconnect Delay (Seconds)',
		name: 'reconnectDelay',
		type: 'number',
		default: 5,
		typeOptions: {
			minValue: 1
		},
		displayOptions: {
			show: {
				resource: ['websockets'],
				reconnect: [true]
			}
		},
		description: 'How long to wait before reconnecting'
	}
];

function parseChannels(channelsInput: string): string[] {
	return [...new Set(
		channelsInput
		.split(/[\n,]+/)
		.map((channel) => channel.trim())
		.filter((channel) => channel.length > 0)
	)];
}

function messageToString(data: unknown): string {
	if(typeof data === 'string') return data;
	if(data instanceof ArrayBuffer) return new TextDecoder('utf-8').decode(data);
	if(data instanceof Uint8Array) return new TextDecoder('utf-8').decode(data);
	if(data instanceof Blob) return ''; // rare for this API
	return String(data);
}

export async function executeWebsocketsTrigger(context: ITriggerFunctions): Promise<ITriggerResponse> {
	const channelsInput = context.getNodeParameter('channels', '') as string;
	const reconnect = context.getNodeParameter('reconnect', true) as boolean;
	const reconnectDelay = context.getNodeParameter('reconnectDelay', 5) as number;

	const channels = parseChannels(channelsInput);
	if (channels.length === 0) {
		throw new NodeOperationError(context.getNode(), 'At least one websocket channel is required');
	}

	const credentials = await context.getCredentials('AlphaInsiderApi');
	const apiKey = credentials.apiKey as string | undefined;
	if (!apiKey) {
		throw new NodeOperationError(context.getNode(), 'AlphaInsider API credentials are required');
	}

	let websocket: WebSocket | undefined;
	let isReconnecting = false;
	let isClosing = false;
	
	const pingLoop = async (wait: number = 30000): Promise<void> => {
		while (!isClosing && websocket?.readyState === WebSocket.OPEN) {
			await sleep(wait);
			if (!isClosing && websocket?.readyState === WebSocket.OPEN) {
				websocket.send(JSON.stringify({ event: 'ping' }));
			}
		}
	};

	const scheduleReconnect = async (): Promise<void> => {
		if(isClosing || !reconnect || isReconnecting) return;

		isReconnecting = true;
		await sleep(reconnectDelay * 1000);
		isReconnecting = false;

		if(!isClosing) {
			connectWebsocket();
		}
	};

	const handleMessage = (data: unknown): void => {
		const rawMessage = messageToString(data);
		try {
			const parsed = JSON.parse(rawMessage) as unknown;
			if(typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
				const message = parsed as IDataObject;
				const event = typeof message.event === 'string' ? message.event : undefined;

				// Skip control messages
				if(event === 'subscribe' || event === 'error') return;

				// Only emit data events
				if(event !== undefined && event.startsWith('ws')) {
					context.emit([[{ json: message }]]);
				}
			}
		} catch {
			// Ignore non-JSON messages
		}
	};

	const connectWebsocket = (): void => {
		if(isClosing) return;

		websocket = new WebSocket(ALPHA_INSIDER_WEBSOCKET_URL);

		websocket.onopen = () => {
			const subscribePayload = {
				event: 'subscribe',
				payload: { channels, token: apiKey }
			};
			websocket?.send(JSON.stringify(subscribePayload));

			// Keep-alive ping
			void pingLoop();
		};

		websocket.onmessage = (event) => handleMessage(event.data);

		websocket.onerror = (event) => {
			if(!isClosing && !reconnect) {
				const err = (event as any).error;
				const errorMsg = (err && err.message) || 'Unknown WebSocket error';
				context.emitError(new NodeOperationError(context.getNode(), `WebSocket error: ${errorMsg}`));
			}
		};

		websocket.onclose = () => {
			websocket = undefined;
			void scheduleReconnect();
		};
	};

	connectWebsocket();

	return {
		closeFunction: async () => {
			isClosing = true;

			if(!websocket) return;

			const socketToClose = websocket;
			websocket = undefined;

			if(socketToClose.readyState === WebSocket.OPEN || socketToClose.readyState === WebSocket.CONNECTING) {
				const closePromise = new Promise<void>((resolve) => {
					socketToClose.addEventListener('close', () => resolve());
				});

				socketToClose.close();

				await Promise.race([closePromise, sleep(1000)]);
			}
		}
	};
}