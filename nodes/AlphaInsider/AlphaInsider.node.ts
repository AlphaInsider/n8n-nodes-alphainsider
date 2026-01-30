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
        type: 'string',
        default: '[]',
        description: 'JSON array of stratgy allocations. Each allocation object should have: stock_id (string), action (long/short/close), and percent (0-1, optional, defaults to 1).',
        placeholder: 'Add allocation JSON string',
        hint: '[{"stock_id":"AAPL:NASDAQ","action":"long","percent":1}]',
        required: true,
        displayOptions: {
          show: {
            action: ['newOrderAllocations']
          }
        }
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
          // Get the allocations as string
          const allocationsStr = this.getNodeParameter('allocations', i) as string;
          let allocations;
          try {
            allocations = JSON.parse(allocationsStr);
            if (!Array.isArray(allocations)) {
              throw new Error('Allocations must be a JSON array');
            }
          }
          catch (parseError) {
            throw new Error(`Invalid JSON for allocations: ${(parseError as Error).message}`);
          }
          // Temporarily override the parameter with parsed value for the helper function
          // Assuming executeNewOrderAllocations uses this.getNodeParameter('allocations', i)
          // If not, you may need to pass it explicitly or adjust the helper
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