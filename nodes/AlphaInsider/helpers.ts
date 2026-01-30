import {
  IExecuteFunctions,
  IHttpRequestMethods
} from 'n8n-workflow';

export async function executeNewOrderAllocations(context: IExecuteFunctions, itemIndex: number): Promise<any> {
  const strategy_id = context.getNodeParameter('strategy_id', itemIndex) as string;
  const leverage = context.getNodeParameter('leverage', itemIndex) as number;
  const allocationsString = context.getNodeParameter('allocations', itemIndex) as string;

  let allocations;
  try {
    allocations = JSON.parse(allocationsString);
  } catch (error) {
    throw new Error(`Invalid JSON in allocations parameter: ${(error as Error).message}`);
  }

  if (!Array.isArray(allocations)) {
    throw new Error('Allocations must be a JSON array');
  }

  const options = {
    method: 'POST' as IHttpRequestMethods,
    url: 'https://alphainsider.com/api/newOrderAllocations',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      strategy_id,
      leverage: Math.trunc(leverage * 100) / 100,
      allocations
    },
    json: true
  };

  return await context.helpers.httpRequestWithAuthentication.call(context, 'AlphaInsiderApi', options);
}
