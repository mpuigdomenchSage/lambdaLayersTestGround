import * as cdk from 'aws-cdk-lib';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { AccessLogFormat, AuthorizationType, LambdaIntegration, LogGroupLogDestination, MethodLoggingLevel, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class InfraStack extends cdk.Stack {
  constructor (scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const openTelemetryLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'openTelemetryLayer', `arn:aws:lambda:${ process.env.CDK_DEFAULT_REGION }:901920570463:layer:aws-otel-collector-amd64-ver-0-62-1:1`);
    const singleLambdaLayer = new lambda.LayerVersion(this, "SingleLambdaLayer", {
      code: lambda.Code.fromAsset('../build/packages/api-layer.zip'),
      compatibleRuntimes: [ lambda.Runtime.DOTNET_6 ],
      compatibleArchitectures: [ lambda.Architecture.X86_64, lambda.Architecture.ARM_64 ],
      description: 'Layer for a single lambda',
      layerVersionName: 'SingleLambdaLayer'
    });


    const noLayer = new lambda.Function(this, 'NoLayer', {
      runtime: lambda.Runtime.DOTNET_6,
      code: lambda.Code.fromAsset('../build/packages/ApiLambda_NoLayers.zip'),
      handler: 'ApiLambda_NoLayers',
      environment: {
        DOTNET_SHARED_STORE: '/opt'
      },
      memorySize: 512,
      timeout: Duration.seconds(300)
    });

    const oneLayer = new lambda.Function(this, 'OneLayer', {
      runtime: lambda.Runtime.DOTNET_6,
      code: lambda.Code.fromAsset('../build/packages/ApiLambda_OneLayer.zip'),
      handler: 'ApiLambda_OneLayer',
      environment: {
        DOTNET_SHARED_STORE: '/opt'
      },
      memorySize: 512,
      timeout: Duration.seconds(300),
      layers: [ singleLambdaLayer ]
    });

    const twoLayer = new lambda.Function(this, 'TwoLayer', {
      runtime: lambda.Runtime.DOTNET_6,
      code: lambda.Code.fromAsset('../build/packages/ApiLambda_OneLayer.zip'),
      handler: 'ApiLambda_OneLayer',
      environment: {
        DOTNET_SHARED_STORE: '/opt'
      },
      memorySize: 512,
      timeout: Duration.seconds(300),
      layers: [ singleLambdaLayer, openTelemetryLayer ]
    });

    const table = new Table(this, 'minionsTesting', {
      tableName: `minionsTesting`,
      partitionKey: { name: "pk", type: AttributeType.STRING },
      sortKey: { name: "sk", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    table.grantWriteData(noLayer);
    table.grantWriteData(oneLayer);
    table.grantWriteData(twoLayer);

    const api = new RestApi(this, `testApiLambdaLayers`, {
      deployOptions: {
        tracingEnabled: true,
        accessLogDestination: new LogGroupLogDestination(new LogGroup(this, 'testApiLambdaLayer-Logs')),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
        loggingLevel: MethodLoggingLevel.INFO,
        throttlingBurstLimit: 300,
        throttlingRateLimit: 500
      },
    });
    const base = api.root
      .addResource('api')
      .addResource('v1.0');

    base.addResource("twoLayer").addMethod('Post', new LambdaIntegration(twoLayer));
    base.addResource("oneLayer").addMethod('Post', new LambdaIntegration(oneLayer));
    base.addResource("noLayers").addMethod('Post', new LambdaIntegration(noLayer));




  }
}
