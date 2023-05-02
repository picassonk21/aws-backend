import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { S3 } from 'aws-sdk';
import csv from 'csv-parser'

const importFileParser = async (event) => {
	try {
		const s3 = new S3({ region: 'eu-west-1' });
		const bucket = 'shop-angular-cloudfront-5';

		for (const record of event.Records) {
			const stream = await s3.getObject({
				Bucket: bucket,
				Key: bucket + '/' + record.s3.object.key,
			}).createReadStream();

			await new Promise((resolve, reject) => {
				stream.pipe(csv())
					.on('open', () => console.log('Opened'))
					.on('data', (data) => console.log(`Result: ${JSON.stringify(data)}`))
					.on('error', (err) => reject(err))
					.on('end', () => resolve('stream closed'))
			});

			await s3.copyObject({
				Bucket: bucket,
				CopySource: `${bucket}/${record.s3.object.key}`,
				Key: record.s3.object.key.replace('uploaded', 'parsed')
			}).promise();

			await s3.deleteObject({
				Bucket: bucket,
				Key: record.s3.object.key,
			});
		}

		return formatJSONResponse({
			statusCode: 200
		});
	} catch (e) {
		return formatJSONResponse({
			statusCode: 500,
			body: {
				message: e.message ?? 'something went wrong',
			},
		});
	}
};

export const main = middyfy(importFileParser);
