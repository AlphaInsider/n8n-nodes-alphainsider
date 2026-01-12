import {
  INodeType,
  INodeTypeDescription,
  ILoadOptionsFunctions,
  INodePropertyOptions,
  IHttpRequestMethods,
  NodeConnectionType,
  IExecuteFunctions,
  INodeExecutionData
} from 'n8n-workflow';

// Helper functions
async function executeNewOrderWebhook(context: IExecuteFunctions, itemIndex: number): Promise<any> {
  const credentials = await context.getCredentials('AlphaInsiderApi');
  const strategy_id = context.getNodeParameter('strategy_id', itemIndex) as string;
  const stock_id = context.getNodeParameter('stock_id', itemIndex) as string;
  const action = context.getNodeParameter('action', itemIndex) as string;
  const leverage = context.getNodeParameter('leverage', itemIndex) as number;

  const options = {
    method: 'POST' as IHttpRequestMethods,
    url: 'https://alphainsider.com/api/newOrderWebhook',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      strategy_id,
      stock_id,
      action,
      api_token: credentials.apiKey as string,
      leverage: Math.round(leverage * 100) / 100
    },
    json: true
  };

  return await context.helpers.httpRequest(options);
}

async function executeApiCall(context: IExecuteFunctions, itemIndex: number): Promise<any> {
  const credentials = await context.getCredentials('AlphaInsiderApi');
  const httpMethod = context.getNodeParameter('httpMethod', itemIndex) as string;
  const endpoint = context.getNodeParameter('endpoint', itemIndex) as string;
  const queryParameters = context.getNodeParameter('queryParameters', itemIndex, '{}') as string;
  const body = context.getNodeParameter('body', itemIndex, '{}') as string;
  const auth = context.getNodeParameter('auth', itemIndex) as boolean;

  const parsedQueryParams = JSON.parse(queryParameters || '{}');
  const parsedBody = JSON.parse(body || '{}');
  const parsedHeaders: Record<string, string> = {'Content-Type': 'application/json'};
  
  if(auth) parsedHeaders['Authorization'] = credentials.apiKey as string;

  const options: any = {
    method: httpMethod as IHttpRequestMethods,
    url: `https://alphainsider.com/api${endpoint}`,
    headers: parsedHeaders,
    qs: Object.keys(parsedQueryParams).length > 0 ? parsedQueryParams : undefined,
    body: Object.keys(parsedBody).length > 0 ? parsedBody : undefined,
    json: true
  };

  return await context.helpers.httpRequest(options);
}

// AlphaInsider Node Class
export class AlphaInsider implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'AlphaInsider',
    name: 'alphaInsider',
    icon: 'file:alphaLogo.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
    description: 'Open Marketplace for Trading Strategies. Follow top crypto & stock strategies in real-time. Automate trades by connecting your broker or exchange. Split capital across multiple strategies.',
    defaults: {
      name: 'AlphaInsider'
    },
    inputs: ['main' as NodeConnectionType],
    outputs: ['main' as NodeConnectionType],
    credentials: [
      {
        name: 'AlphaInsiderApi',
        required: false
      }
    ],
    requestDefaults: {
      baseURL: 'https://alphainsider.com/api',
      headers: {
        'Content-Type': 'application/json'
      }
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
            value: 'newOrderWebhook'
          },
          {
            name: 'Custom API Call',
            value: 'apiCall'
          }
        ],
        default: 'newOrderWebhook'
      },

      // === NEW ORDER WEBHOOK OPERATION === //
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['newOrderWebhook']
          }
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            action: 'Create a new webhook order',
            description: 'New order from webhook.'
          }
        ],
        default: 'create'
      },

      // === CUSTOM API CALL OPERATION === //
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['apiCall']
          }
        },
        options: [
          {
            name: 'Create',
            value: 'Create',
            action: 'Create a custom API call',
            description: 'Call any AlphaInsider API endpoint with full control over method, path, query parameters and body.'
          }
        ],
        default: 'Create'
      },

      // === NEW ORDER WEBHOOK PARAMETERS === //
      {
        displayName: 'Strategy',
        name: 'strategy_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getStrategies'
        },
        default: '',
        required: true,
        description: 'Select a strategy from your AlphaInsider account.',
        displayOptions: {
          show: {
            resource: ['newOrderWebhook']
          }
        }
      },
      {
        displayName: 'Stock ID',
        name: 'stock_id',
        type: 'string',
        default: '',
        required: true,
        description: 'The id of the stock: "stock:exchange" or "stock_id". Ex: AAPL:NASDAQ.',
        displayOptions: {
          show: {
            resource: ['newOrderWebhook']
          }
        }
      },
      {
        displayName: 'Action',
        name: 'action',
        type: 'options',
        default: '',
        required: true,
        options: [
          {name: 'Buy', value: 'buy'},
          {name: 'Long', value: 'long'},
          {name: 'Sell', value: 'sell'},
          {name: 'Short', value: 'short'},
          {name: 'Close', value: 'close'},
          {name: 'Flat', value: 'flat'}
        ],
        description: 'Order actions.',
        displayOptions: {
          show: {
            resource: ['newOrderWebhook']
          }
        }
      },
      {
        displayName: 'Leverage',
        name: 'leverage',
        type: 'number',
        default: 1.5,
        description: 'Leverage to trade at.',
        typeOptions: {
          minValue: 0,
          maxValue: 2
        },
        displayOptions: {
          show: {
            resource: ['newOrderWebhook']
          }
        }
      },

      // === CUSTOM API CALL PARAMETERS === //
      {
        displayName: 'HTTP Method',
        name: 'httpMethod',
        type: 'options',
        default: 'GET',
        required: true,
        options: [
          {name: 'GET', value: 'GET'},
          {name: 'POST', value: 'POST'}
        ],
        description: 'HTTP request method.',
        displayOptions: {
          show: {
            resource: ['apiCall']
          }
        }
      },
      {
        displayName: 'Has Authentication',
        name: 'auth',
        type: 'boolean',
        default: true,
        required: true,
        description: 'Require authentication for request.',
        displayOptions: {
          show: {
            resource: ['apiCall']
          }
        }
      },
      {
        displayName: 'Endpoint',
        name: 'endpoint',
        type: 'string',
        default: '',
        required: true,
        placeholder: '/getUserInfo',
        description: 'Endpoint path appended to https://alphainsider.com/api (must start with /).',
        displayOptions: {
          show: {
            resource: ['apiCall']
          }
        }
      },
      {
        displayName: 'Query Parameters',
        name: 'queryParameters',
        type: 'json',
        default: '{}',
        description: 'Query/string parameters as a JSON object. Leave {} for none.',
        displayOptions: {
          show: {
            resource: ['apiCall']
          }
        }
      },
      {
        displayName: 'Body',
        name: 'body',
        type: 'json',
        default: '{}',
        description: 'Request body as a JSON object. Leave {} if no body should be sent.',
        displayOptions: {
          show: {
            resource: ['apiCall']
          }
        }
      }
    ]
  };

  methods = {
    loadOptions: {
      async getStrategies(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        try {
          const credentials = await this.getCredentials('AlphaInsiderApi');

          //if no credentials, return empty array
          if (!credentials || !credentials.apiKey) return [];

          const userInfoOptions = {
            method: 'GET' as IHttpRequestMethods,
            url: 'https://alphainsider.com/api/getUserInfo',
            headers: {
              Authorization: credentials.apiKey as string,
              'Content-Type': 'application/json'
            },
            json: true
          };

          const userInfo = await this.helpers.httpRequest(userInfoOptions);
          const userId = userInfo.response?.user_id;

          if (!userId) {
            throw new Error('Could not retrieve user ID from API');
          }

          const strategiesOptions = {
            method: 'GET' as IHttpRequestMethods,
            url: 'https://alphainsider.com/api/getUserStrategies',
            headers: {
              Authorization: credentials.apiKey as string,
              'Content-Type': 'application/json'
            },
            qs: {
              user_id: userId as string
            },
            json: true
          };

          const strategyInfo = await this.helpers.httpRequest(strategiesOptions);
          const strategies = strategyInfo.response;

          if (!Array.isArray(strategies)) {
            this.logger.info('No strategies found.');
            return [];
          }

          return strategies.map((strategy: any) => ({
            name: strategy.name,
            value: strategy.strategy_id
          }));
        }
        catch (error) {
          return [];
        }
      }
    }
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        let responseData;

        if (resource === 'newOrderWebhook') {
          responseData = await executeNewOrderWebhook(this, i);
        } else if (resource === 'apiCall') {
          responseData = await executeApiCall(this, i);
        }

        returnData.push({
          json: responseData
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message
            }
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}