import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { S3 } from 'aws-sdk';

import schema from './schema';

const importProductsFile: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	if (!event.queryStringParameters.name) {
		return formatJSONResponse({
			statusCode: 400,
			body: {
				message: 'file name was not provided'
			}
		});
	}

	const s3 = new S3({ region: 'eu-west-1' });
	const bucket = 'shop-angular-cloudfront-5';
	const filePath = 'uploaded/' + event.queryStringParameters.name;
	const params = {
		Bucket: bucket,
		Key: filePath,
		Expires: 60,
		ContentType: 'text/csv'
	};

	const url = await s3.getSignedUrl('putObject', params);
	console.log(url);

  return formatJSONResponse({
		statusCode: 200,
    body: {
			url
		},
  });
};

export const main = middyfy(importProductsFile);
