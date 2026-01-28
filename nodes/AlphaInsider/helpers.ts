import {
  IExecuteFunctions,
  IHttpRequestMethods
} from 'n8n-workflow';

export async function executeNewOrderAllocations(context: IExecuteFunctions, itemIndex: number): Promise<any> {
  const strategy_id = context.getNodeParameter('strategy_id', itemIndex) as string;
  const leverage = context.getNodeParameter('leverage', itemIndex) as number;
  const allocations = context.getNodeParameter('allocations', itemIndex) as any;

  const options = {
    method: 'POST' as IHttpRequestMethods,
    url: 'https://alphainsider.com/api/newOrderAllocations',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      strategy_id,
      leverage: Math.trunc(leverage * 100) / 100,
      allocations: allocations.allocationValues
    },
    json: true
  };

  return await context.helpers.httpRequestWithAuthentication.call(context, 'AlphaInsiderApi', options);
}
