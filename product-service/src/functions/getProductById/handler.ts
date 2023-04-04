import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { products } from '../../mock-data/products';

import schema from './schema';

const getProductById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	const { id } = JSON.parse(JSON.stringify(event)).pathParameters;
	const product = products.find((product) => product.id === id);
	if (!product) {
		return formatJSONResponse({
			statusCode: 400,
			body: {
				message: 'Product not found',
			},
		});
	}

  return formatJSONResponse({
		statusCode: 200,
		body: {
			product,
		},
  });
};

export const main = middyfy(getProductById);
