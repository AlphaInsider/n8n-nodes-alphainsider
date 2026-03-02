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
      description: 'Generate your API key from <a href="https://alphainsider.com/settings/developers" target="_blank">AlphaInsider Developer Settings</a>. <br> Click the <strong>n8n/make/zapier</strong> button to get the permissions needed for the API key.'
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
      method: 'POST',
      baseURL: 'https://alphainsider.com/api',
      url: '/verifyToken',
      body: {
        token: '={{$credentials.apiKey}}'
      }
    }
  };
}
