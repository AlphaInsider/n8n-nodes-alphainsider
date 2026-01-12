import {
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties
} from 'n8n-workflow';

export class AlphaInsiderApi implements ICredentialType {
  name = 'AlphaInsiderApi';
  displayName = 'AlphaInsider API';

  documentationUrl = 'https://api.alphainsider.com/resources/webhooks/neworderwebhook';

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true
      },
      default: '',
      description: 'You can generate an API key from the [developer settings](https://alphainsider.com/settings/developers) page. Set permission webhooks -> newOrderWebook.'
    }
  ];

  test: ICredentialTestRequest = {
    request: {
      method: 'GET',
      baseURL: 'https://alphainsider.com/api',
      url: '/getUserInfo',
      headers: {
        Authorization: '={{$credentials.apiKey}}'
      },
      qs: {}
    }
  };
}
