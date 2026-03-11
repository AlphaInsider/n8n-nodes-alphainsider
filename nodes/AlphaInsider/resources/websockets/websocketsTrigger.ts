import {
	IDataObject,
	INodeProperties,
	ITriggerFunctions,
	ITriggerResponse,
	NodeOperationError
} from 'n8n-workflow';
import WebSocket, { RawData } from 'ws';

const ALPHA_INSIDER_WEBSOCKET_URL = 'wss://alphainsider.com/ws';
const WEBSOCKET_USER_AGENT = 'n8n-alphainsider-websocket/1.0';

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

function messageToString(data: RawData): string {
	if (typeof data === 'string') {
		return data;
	}
	if (Buffer.isBuffer(data)) {
		return data.toString('utf8');
	}
	if (Array.isArray(data)) {
		return Buffer.concat(data).toString('utf8');
	}
	return Buffer.from(data).toString('utf8');
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
	let reconnectTimeout: ReturnType<typeof setTimeout> | undefined;
	let pingInterval: ReturnType<typeof setInterval> | undefined;
	let isClosing = false;

	const scheduleReconnect = (): void => {
		if (isClosing || !reconnect || reconnectTimeout !== undefined) {
			return;
		}

		reconnectTimeout = setTimeout(() => {
			reconnectTimeout = undefined;
			connectWebsocket();
		}, reconnectDelay * 1000);
	};

	const handleMessage = (data: RawData): void => {
		const rawMessage = messageToString(data);

		try {
			const parsed = JSON.parse(rawMessage) as unknown;

			if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
				const message = parsed as IDataObject;
				const event = typeof message.event === 'string' ? message.event : undefined;

				// Skip control messages
				if (event === 'subscribe' || event === 'error') {
					return;
				}

				// Only emit data events (those starting with 'ws')
				if (event !== undefined && event.startsWith('ws')) {
					context.emit([[{ json: message }]]);
				}
			}
		} catch {
			// Ignore non-JSON messages
		}
	};

	const connectWebsocket = (): void => {
		if (isClosing) {
			return;
		}

		websocket = new WebSocket(ALPHA_INSIDER_WEBSOCKET_URL, {
			headers: {
				'User-Agent': WEBSOCKET_USER_AGENT
			}
		});

		websocket.on('open', () => {
			const subscribePayload = {
				event: 'subscribe',
				payload: {
					channels,
					token: apiKey
				}
			};
			websocket?.send(JSON.stringify(subscribePayload));

			// Start ping interval to keep connection alive
			pingInterval = setInterval(() => {
				if (websocket?.readyState === WebSocket.OPEN) {
					websocket.ping();
				}
			}, 5000);
		});

		websocket.on('message', handleMessage);

		websocket.on('error', (error: Error) => {
			if (!isClosing && !reconnect) {
				context.emitError(new NodeOperationError(context.getNode(), `WebSocket error: ${error.message}`));
			}
		});

		websocket.on('close', () => {
			if (pingInterval !== undefined) {
				clearInterval(pingInterval);
				pingInterval = undefined;
			}
			websocket = undefined;
			scheduleReconnect();
		});
	};

	connectWebsocket();

	return {
		closeFunction: async () => {
			isClosing = true;

			if (reconnectTimeout !== undefined) {
				clearTimeout(reconnectTimeout);
				reconnectTimeout = undefined;
			}

			if (pingInterval !== undefined) {
				clearInterval(pingInterval);
				pingInterval = undefined;
			}

			if (!websocket) {
				return;
			}

			const socketToClose = websocket;
			websocket = undefined;

			await new Promise<void>((resolve) => {
				let done = false;
				const finish = () => {
					if (!done) {
						done = true;
						resolve();
					}
				};

				socketToClose.once('close', finish);

				if (socketToClose.readyState === WebSocket.OPEN || socketToClose.readyState === WebSocket.CONNECTING) {
					socketToClose.close();
					setTimeout(finish, 1000);
					return;
				}

				finish();
			});
		}
	};
}
