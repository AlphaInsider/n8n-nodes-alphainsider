import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties
} from 'n8n-workflow';

export class AlphaInsiderApi implements ICredentialType {
  name = 'AlphaInsiderApi';
  displayName = 'AlphaInsider API';

  documentationUrl = 'https://api.alphainsider.com';

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true
      },
      default: '',
      description: 'Generate your API key from <a href="https://alphainsider.com/settings/developers" target="_blank">AlphaInsider Developer Settings</a>. <br> Make sure to set your permissions (e.g., webhooks -> newOrderWebhook)'
    }
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '={{$credentials.apiKey}}'
      }
    }
  };

  test: ICredentialTestRequest = {
    request: {
      method: 'GET',
      baseURL: 'https://alphainsider.com/api',
      url: '/getUserInfo'
    }
  };
}
