import { handlerPath } from '@libs/handler-resolver';

export const importProductsFile = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'import',
        request: {
					parameters: {
						querystrings: {
							name: true
						},
					}
        },
				cors: true,
      },
    },
  ],
};
