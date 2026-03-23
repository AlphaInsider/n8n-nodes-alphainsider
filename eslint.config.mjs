import communityNodes from '@n8n/eslint-plugin-community-nodes';

export default [
	communityNodes.configs.recommended,
	{
		rules: {
			'no-undef': 'off',
			'no-unused-vars': 'off',
			'no-empty': 'off',
			'prefer-arrow-callback': 'error',
			'no-var': 'error',
		}
	}
];
