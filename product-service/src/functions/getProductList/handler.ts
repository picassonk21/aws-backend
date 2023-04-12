import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { products } from '../../mock-data/products';

import schema from './schema';

const getProductList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  return formatJSONResponse({
		statusCode: 200,
		body: {
			products,
		},
  });
};

export const main = middyfy(getProductList);
