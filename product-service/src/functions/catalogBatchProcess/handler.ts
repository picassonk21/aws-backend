import { createNewProduct } from '@functions/db/utils';
import { SQSEvent, SQSHandler } from 'aws-lambda';
import { SNS } from 'aws-sdk';

export const catalogBatchProcess: SQSHandler = async (event: SQSEvent) => {
	try {
		const promises = event.Records.map((record) => {
			const productData = JSON.parse(record.body);
			
			return createNewProduct({
				title: productData.title,
				description: productData.description,
				count: +productData.count,
				price: +productData.price
			});
		});
	
		await Promise.all(promises);
		const sns = new SNS({ region: 'eu-west-1' });
		await sns.publish(
			{
				Subject: 'New Products',
				Message: `New products were added to the database in the amount of ${event.Records.length}`,
				TopicArn: process.env.TOPIC_ARN
			}, 
			(err) => {
				if (err) {
					console.log(err);
				} else {
					console.log('Sent email to provided address');
				}
			}
		).promise();

		console.log('topic-arn: ', process.env.TOPIC_ARN);
		
	} catch (e) {
		console.log(e.message);
	}
};
