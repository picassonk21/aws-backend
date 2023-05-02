import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDB } from 'aws-sdk';

import schema from './schema';

const dynamo = new DynamoDB.DocumentClient();

const getProductsData = async () => {
	const scanResults = await dynamo.scan({
		TableName: process.env.PRODUCTS_TABLE,
	}).promise();
	return scanResults.Items;
};

const getStockData = async () => {
	const queryResults = await dynamo.scan({
		TableName: process.env.STOCK_TABLE,
	}).promise();

	return queryResults.Items;
};

const getProductList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	console.log(event);
  const productsData = await getProductsData();
	const stockData = await getStockData();

	const products = productsData.map((product) => {
		const productStockData = stockData.find((stockData) => stockData.product_id === product.id);
		return {
			...product,
			count: productStockData.count ?? 0,
		};
	});

	return formatJSONResponse({
		statusCode: 200,
		body: {
			products: products,
		},
  });
};

export const main = middyfy(getProductList);
