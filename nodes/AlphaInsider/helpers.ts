import {
  IExecuteFunctions,
  IHttpRequestMethods
} from 'n8n-workflow';

export async function executeNewOrderWebhook(context: IExecuteFunctions, itemIndex: number): Promise<any> {
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

export async function executeApiCall(context: IExecuteFunctions, itemIndex: number): Promise<any> {
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
