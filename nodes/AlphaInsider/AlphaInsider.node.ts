import {
  INodeType,
  INodeTypeDescription,
  ILoadOptionsFunctions,
  INodePropertyOptions,
  IHttpRequestMethods,
  IExecuteFunctions,
  INodeExecutionData,
  NodeConnectionTypes
} from 'n8n-workflow';

import {executeNewOrderAllocations} from './helpers';

// AlphaInsider Node Class
export class AlphaInsider implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'AlphaInsider',
    name: 'alphaInsider',
    icon: 'file:logo.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["action"]}}',
    description: 'Open Marketplace for Trading Strategies. Follow top crypto & stock strategies in real-time. Automate trades by connecting your broker or exchange. Split capital across multiple strategies.',
    defaults: {
      name: 'AlphaInsider'
    },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [
      {
        name: 'AlphaInsiderApi',
        required: true
      }
    ],
    properties: [
      {
        displayName: 'Action',
        name: 'action',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'New Order Allocations',
            value: 'newOrderAllocations',
            action: 'Create new order allocations',
            description: 'Create new orders for a given strategy to match the allocations list.'
          },
          {
            name: 'Custom API Call',
            value: 'customApiCall',
            action: 'Use HTTP Request node',
            description: 'Use the HTTP Request node for all other API calls'
          }
        ],
        default: 'newOrderAllocations'
      },

      // === CUSTOM API CALL NOTICE === //
      {
        displayName: 'For custom API calls, use the HTTP Request node with your AlphaInsider API credentials. Your credentials will be available in the HTTP Request node\'s "Authentication" -> "Predefined Credential" dropdown.',
        name: 'customApiNotice',
        type: 'notice',
        default: '',
        displayOptions: {
          show: {
            action: ['customApiCall']
          }
        }
      },

      // === NEW ORDER ALLOCATIONS PARAMETERS === //
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
            action: ['newOrderAllocations']
          }
        }
      },
      {
        displayName: 'Allocations',
        name: 'allocations',
        type: 'fixedCollection',
        default: {},
        typeOptions: {
          multipleValues: true
        },
        description: 'Array of allocations to create',
        placeholder: 'Add Allocation',
        required: true,
        displayOptions: {
          show: {
            action: ['newOrderAllocations']
          }
        },
        options: [
          {
            name: 'allocationValues',
            displayName: 'Allocation',
            values: [
              {
                displayName: 'Stock ID',
                name: 'stock_id',
                type: 'string',
                default: '',
                required: true,
                description: 'Stock ID: "SYMBOL:EXCHANGE" or stock_id. Ex: AAPL:NASDAQ.',
                placeholder: 'AAPL:NASDAQ'
              },
              {
                displayName: 'Action',
                name: 'action',
                type: 'options',
                default: 'long',
                required: true,
                options: [
                  {name: 'Long', value: 'long'},
                  {name: 'Short', value: 'short'},
                  {name: 'Close', value: 'close'}
                ],
                description: 'The action for the order'
              },
              {
                displayName: 'Percent',
                name: 'percent',
                type: 'number',
                default: 1,
                description: 'Percentage of strategy buying power (0 <= x <= 1)',
                typeOptions: {
                  minValue: 0,
                  maxValue: 1,
                  numberPrecision: 4
                }
              }
            ]
          }
        ]
      },
      {
        displayName: 'Leverage',
        name: 'leverage',
        type: 'number',
        default: 1,
        description: 'Leverage to trade at (0 <= x < 2). Defaults to 1. WARNING: 2x leverage orders may fail if prices move; use less than 1.95x for reliable fills.',
        typeOptions: {
          minValue: 0,
          maxValue: 2,
          numberPrecision: 2
        },
        displayOptions: {
          show: {
            action: ['newOrderAllocations']
          }
        }
      }
    ]
  };

  methods = {
    loadOptions: {
      async getStrategies(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        try {
          const userInfoOptions = {
            method: 'GET' as IHttpRequestMethods,
            url: 'https://alphainsider.com/api/getUserInfo',
            headers: {
              'Content-Type': 'application/json'
            },
            json: true
          };

          const userInfo = await this.helpers.httpRequestWithAuthentication.call(this, 'AlphaInsiderApi', userInfoOptions);
          const userId = userInfo.response?.user_id;

          if (!userId) {
            throw new Error('Could not retrieve user ID from API');
          }

          const strategiesOptions = {
            method: 'GET' as IHttpRequestMethods,
            url: 'https://alphainsider.com/api/getUserStrategies',
            headers: {
              'Content-Type': 'application/json'
            },
            qs: {
              user_id: userId
            },
            json: true
          };

          const strategyInfo = await this.helpers.httpRequestWithAuthentication.call(this, 'AlphaInsiderApi', strategiesOptions);
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
        const action = this.getNodeParameter('action', i) as string;
        let responseData;

        if (action === 'newOrderAllocations') {
          const credentials = await this.getCredentials('AlphaInsiderApi');
          if (!credentials || !credentials.apiKey) {
            throw new Error('AlphaInsider API credentials are required for creating order allocations');
          }
          responseData = await executeNewOrderAllocations(this, i);
        } else {
          responseData = {
            message: 'For custom API calls, please use the HTTP Request node with your AlphaInsider API credentials.',
            ...items[i].json
          };
        }

        returnData.push({
          json: responseData,
          pairedItem: { item: i }
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: (error as Error).message },
            pairedItem: { item: i }
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}