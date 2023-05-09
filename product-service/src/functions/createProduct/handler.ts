import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { createNewProduct } from '@functions/db/utils';

const createProduct = async (event) => {

	if (!event.body.title || isNaN(parseFloat(String(event.body.price)))) {
		return formatJSONResponse({
			statusCode: 500
		});
	}

	try {
		await createNewProduct({
			description: event.body.description ?? '',
			price: event.body.price,
			title: event.body.title,
			count: event.body.count
		})
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
