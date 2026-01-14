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

import {executeNewOrderWebhook} from './helpers';

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
            name: 'New Order Webhook',
            value: 'newOrderWebhook',
            action: 'Create new order webhook',
            description: 'Create a new order from webhook'
          },
          {
            name: 'Custom API Call',
            value: 'customApiCall',
            action: 'Use HTTP Request node',
            description: 'Use the HTTP Request node for all other API calls'
          }
        ],
        default: 'newOrderWebhook'
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
            action: ['newOrderWebhook']
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
            action: ['newOrderWebhook']
          }
        }
      },
      {
        displayName: 'Order Action',
        name: 'orderAction',
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
            action: ['newOrderWebhook']
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
            action: ['newOrderWebhook']
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

        if (action === 'newOrderWebhook') {
          const credentials = await this.getCredentials('AlphaInsiderApi');
          if (!credentials || !credentials.apiKey) {
            throw new Error('AlphaInsider API credentials are required for creating webhook orders');
          }
          responseData = await executeNewOrderWebhook(this, i);
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