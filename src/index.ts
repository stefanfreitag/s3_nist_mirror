import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps, aws_events as events, aws_events_targets as eventTargets, aws_iam as iam, aws_lambda as lambda, aws_s3 as s3 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class NistMirrorStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'bucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: false,
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const bucketContentStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['s3:GetObject'],
      resources: [bucket.bucketArn + '/*'],
      principals: [new iam.AnyPrincipal()],
    });
    bucketContentStatement.addCondition('IpAddress', {
      'aws:SourceIp': '87.122.220.125/32',
    });

    const bucketStatement: iam.PolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['s3:ListBucket', 's3:GetBucketLocation'],
      resources: [bucket.bucketArn],
      principals: [new iam.AnyPrincipal()],
    });
    bucketStatement.addCondition('IpAddress', {
      'aws:SourceIp': '87.122.220.125/32',
    });

    const bucketPolicy = new s3.BucketPolicy(this, 'bucketPolicy', {
      bucket: bucket,
    });

    bucketPolicy.document.addStatements(
      bucketContentStatement,
      bucketStatement,
    );

    const layer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'nist-cdk',
      'arn:aws:lambda:eu-central-1:544871327925:layer:NIST-CDK-Layer:2',
    );

    const fn = new lambda.Function(this, 'MyFunction', {
      runtime: lambda.Runtime.PYTHON_3_7,
      handler: 'download_files.lambda_handler',
      code: lambda.Code.fromAsset('./assets/'),
      timeout: Duration.minutes(1),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
      layers: [layer],
    });

    bucket.grantReadWrite(fn);

    const target = new eventTargets.LambdaFunction(fn);
    new events.Rule(this, 'ScheduleRule', {
      schedule: events.Schedule.cron({ minute: '0', hour: '0', day: '1', month: '*' }),
      targets: [target],
    });

    new CfnOutput(this, 'bucketArnOutput', {
      value: bucket.bucketArn,
      description: 'Bucket ARN',
    });
  }
}
