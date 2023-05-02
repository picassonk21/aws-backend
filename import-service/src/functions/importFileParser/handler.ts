import { S3, SQS } from 'aws-sdk';
import csv from 'csv-parser'

export const importFileParser = async (event) => {
	console.log('event: ', event);
	console.log('key: ', event.Records[0].s3.object.key);
	try {
		const s3 = new S3({ region: 'eu-west-1' });
		const sqs = new SQS({ region: 'eu-west-1' });

		const bucket = 'shop-angular-cloudfront-5';

		for (const record of event.Records) {
			const stream = await s3.getObject({
				Bucket: bucket,
				Key: record.s3.object.key,
			}).createReadStream();

			await new Promise((resolve, reject) => {
				stream.pipe(csv())
					.on('data', async (data) => {
						await sqs.sendMessage({ MessageBody: JSON.stringify(data), QueueUrl: process.env.SQS_URL }).promise();
						console.log('message sent');
					})
					.on('error', (err) => reject(err))
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

		return {
			statusCode: 200,
			headers: {
				'Access-Control-Allow-Origins': '*',
				'Access-Control-Allow-Headers': '*',
				'Access-Control-Allow-Methods': '*',
			}
		};
	} catch (e) {
		return {
			statusCode: 500,
			body: {
				message: e.message ?? 'something went wrong',
			}
		};
	}
};
