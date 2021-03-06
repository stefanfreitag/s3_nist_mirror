import cdk = require("@aws-cdk/core");
import { Bucket, BlockPublicAccess, BucketPolicy } from "@aws-cdk/aws-s3";
import { RemovalPolicy, CfnOutput, Duration } from "@aws-cdk/core";
import { PolicyStatement, Effect, AnyPrincipal, Role } from "@aws-cdk/aws-iam";
import { Runtime, Code, Function, LayerVersion } from "@aws-cdk/aws-lambda";
import path = require("path");
import { Schedule, Rule } from "@aws-cdk/aws-events";
import { LambdaFunction } from "@aws-cdk/aws-events-targets";

export class NistMirrorStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, "bucket", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      versioned: false,
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const bucketContentStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:GetObject"],
      resources: [bucket.bucketArn + "/*"],
      principals: [new AnyPrincipal()],
    });
    bucketContentStatement.addCondition("IpAddress", {
      "aws:SourceIp": "87.122.220.125/32",
    });

    const bucketStatement: PolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:ListBucket", "s3:GetBucketLocation"],
      resources: [bucket.bucketArn],
      principals: [new AnyPrincipal()],
    });
    bucketStatement.addCondition("IpAddress", {
      "aws:SourceIp": "87.122.220.125/32",
    });

    const bucketPolicy = new BucketPolicy(this, "bucketPolicy", {
      bucket: bucket,
    });

    bucketPolicy.document.addStatements(
      bucketContentStatement,
      bucketStatement
    );

    const layer = LayerVersion.fromLayerVersionArn(
      this,
      "nist-cdk",
      "arn:aws:lambda:eu-central-1:544871327925:layer:NIST-CDK-Layer:2"
    );

    const fn = new Function(this, "MyFunction", {
      runtime: Runtime.PYTHON_3_7,
      handler: "download_files.lambda_handler",
      code: Code.fromAsset(path.join("./assets/")),
      timeout: Duration.minutes(1),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
      layers: [layer],
    });

    bucket.grantReadWrite(fn);

    const target = new LambdaFunction(fn);
    new Rule(this, "ScheduleRule", {
      schedule: Schedule.cron({ minute: "0", hour: "0", day: "1", month: "*" }),
      targets: [target],
    });

    new CfnOutput(this, "bucketArnOutput", {
      value: bucket.bucketArn,
      description: "Bucket ARN",
    });
  }
}
