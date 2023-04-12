import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { DynamoDB } from 'aws-sdk';

import schema from './schema';

const dynamo = new DynamoDB.DocumentClient();

const getProductData = async (id) => {
	const queryResults = await dynamo.query({
		TableName: process.env.PRODUCTS_TABLE,
		KeyConditionExpression: 'id = :id',
		ExpressionAttributeValues: {':id': id}
	}).promise();

	return queryResults;
};

const getStockData = async (id) => {
	const queryResults = await dynamo.query({
		TableName: process.env.STOCK_TABLE,
		KeyConditionExpression: 'product_id = :id',
		ExpressionAttributeValues: {':id': id}
	}).promise();

	return queryResults;
};

const getProductById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	console.log(event);
	const { id } = JSON.parse(JSON.stringify(event)).pathParameters;
	const productData = (await getProductData(id)).Items[0];
	const stockData = (await getStockData(id)).Items[0];
	const product = Object.assign(productData, { count: stockData.count ?? 0 });
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
