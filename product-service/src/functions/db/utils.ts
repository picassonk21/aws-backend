import { DynamoDB } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

const dynamo = new DynamoDB.DocumentClient();

export const createNewProduct = async (item) => {
	const id = uuid();

	const productData = {
		id,
		description: item.description ?? '',
		price: item.price,
		title: item.title,
	};
	const stockData = {
		product_id: id,
		count: item.count
	};
	return await Promise.all([createProductData(productData), createStockData(stockData)]);
}

export const createProductData = async (item) => {
	return dynamo.put({
		TableName: process.env.PRODUCTS_TABLE,
		Item: item,
	}).promise();
};

export const createStockData = async (item) => {
	return dynamo.put({
		TableName: process.env.STOCK_TABLE,
		Item: item
	}).promise();
};