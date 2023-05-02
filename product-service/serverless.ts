import type { AWS } from '@serverless/typescript';

import { getProductList, getProductById, createProduct, catalogBatchProcess } from '@functions/index';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-auto-swagger'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
		region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
			PRODUCTS_TABLE: 'aws_cloudfront_products',
			STOCK_TABLE: 'aws_cloudfront_stock',
			TOPIC_ARN: {
				Ref: 'createProductTopic'
			}
    },
		iam: {
			role: {
				statements: [
					{
						'Effect': 'Allow',
						'Action': ['dynamodb:Query', 'dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:PutItem'],
						'Resource': '*',
					},
					{
						'Effect': 'Allow',
						'Action': ['sqs:sendMessage', 'sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:GetQueueAttributes'],
						'Resource': '*'
					},
					{
						'Effect': 'Allow',
						'Action': ['sns:*'],
						'Resource': '*'
					}
				]
			}
		}
  },
	resources: {
		Resources: {
			catalogItemsQueue: {
				Type: 'AWS::SQS::Queue',
				Properties: {
					QueueName: 'catalog-items-source-events-queue',
				}
			},
			createProductTopic: {
				Type: 'AWS::SNS::Topic',
				Properties: {
					TopicName: 'create-product-topic'
				}
			},
			createProductTopicSubscription: {
				Type: 'AWS::SNS::Subscription',
				Properties: {
					Endpoint: 'yahor_barysevich@epam.com',
					Protocol: 'email',
					TopicArn: {
						Ref: 'createProductTopic'
					}
				}
			}
		}
	},
  functions: { getProductList, getProductById, createProduct, catalogBatchProcess },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
