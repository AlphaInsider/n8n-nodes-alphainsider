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
import {tradesDescription} from './resources/trades';

// AlphaInsider Node Class
export class AlphaInsider implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'AlphaInsider',
    name: 'alphaInsider',
    icon: 'file:logo.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
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
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Trades',
            value: 'trades',
          }
        ],
        default: 'trades',
      },
      ...tradesDescription,
    ]
  };

  methods = {
    loadOptions: {
      async getUserStrategies(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
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
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;

        const credentials = await this.getCredentials('AlphaInsiderApi');
        if (!credentials || !credentials.apiKey) {
          throw new Error('AlphaInsider API credentials are required');
        }

        let responseData;

        if (resource === 'trades') {
          if (operation === 'newOrderAllocations') {
            responseData = await executeNewOrderAllocations(this, i);
          }
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