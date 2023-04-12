import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

import schema from './schema';

const dynamo = new DynamoDB.DocumentClient();

const createProductData = async (item) => {
	return dynamo.put({
		TableName: process.env.PRODUCTS_TABLE,
		Item: item,
	}).promise();
};

const createStockData = async (item) => {
	return dynamo.put({
		TableName: process.env.STOCK_TABLE,
		Item: item
	}).promise();
};

const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	console.log(event);

	if (!event.body.title || isNaN(parseFloat(String(event.body.price)))) {
		return formatJSONResponse({
			statusCode: 500
		});
	}

	const id = uuid();
	const productData = {
		id,
		description: event.body.description ?? '',
		price: event.body.price,
		title: event.body.title,
	};
	const stockData = {
		product_id: id,
		count: event.body.count
	};

	try {
		await createProductData(productData);
		await createStockData(stockData)
		return formatJSONResponse({
			statusCode: 200
		});
	} catch {
		return formatJSONResponse({
			statusCode: 500
		});
	}
};

export const main = middyfy(createProduct);
