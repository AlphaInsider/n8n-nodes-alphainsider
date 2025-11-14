import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
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
				password: true,
			},
			default: '',
            description: 'You can generate an API key from the [developer settings](https://alphainsider.com/settings/developers) page. Set permission webhooks -> newOrderWebook.'
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
                Authorization: '={{$credentials.apiKey}}',
                'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			method: 'GET',
			baseURL: 'https://alphainsider.com/api',
			url: '/getUserInfo',
			qs: { },
		},
	};
}
