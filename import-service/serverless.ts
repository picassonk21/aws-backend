import type { AWS } from '@serverless/typescript';

import { importProductsFile } from '@functions/importProductsFile';
import { importFileParser } from '@functions/importFileParser';

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
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
			SQS_URL: 'https://sqs.eu-west-1.amazonaws.com/926158231462/catalog-items-source-events-queue',
    },
		iam: {
			role: {
				statements: [
					{
						'Effect': 'Allow',
						'Action': ['s3:*'],
						'Resource': '*'
					},
					{
						'Effect': 'Allow',
						'Action': ['sqs:SendMessage'],
						'Resource': '*'
					}
				]
			}
		}
  },
  // import the function via paths
  functions: { importProductsFile, importFileParser },
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
