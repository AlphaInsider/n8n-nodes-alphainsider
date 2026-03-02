import {
  INodeType,
  INodeTypeDescription,
  IExecuteFunctions,
  INodeExecutionData,
  NodeConnectionTypes
} from 'n8n-workflow';

// AlphaInsider Node Class
export class AlphaInsider implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'AlphaInsider',
    name: 'alphaInsider',
    icon: 'file:logo.svg',
    group: ['transform'],
    version: 1,
    subtitle: 'Authentication Provider',
    description: 'AlphaInsider authentication credential for use with HTTP Request node. Automate your trading strategies on AlphaInsider.',
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
    properties: []
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const credentials = await this.getCredentials('AlphaInsiderApi');
        if (!credentials || !credentials.apiKey) {
          throw new Error('AlphaInsider API credentials are required');
        }

        returnData.push({
          json: {
            message: 'AlphaInsider authentication configured. Use this credential with HTTP Request node.',
            authenticated: true
          },
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