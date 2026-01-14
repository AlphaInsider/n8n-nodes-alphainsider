import {
  IExecuteFunctions,
  IHttpRequestMethods
} from 'n8n-workflow';

export async function executeNewOrderWebhook(context: IExecuteFunctions, itemIndex: number): Promise<any> {
  const strategy_id = context.getNodeParameter('strategy_id', itemIndex) as string;
  const stock_id = context.getNodeParameter('stock_id', itemIndex) as string;
  const orderAction = context.getNodeParameter('orderAction', itemIndex) as string;
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
      action: orderAction,
      leverage: Math.trunc(leverage * 100) / 100
    },
    json: true
  };

  return await context.helpers.httpRequestWithAuthentication.call(context, 'AlphaInsiderApi', options);
}
