import cdk = require("@aws-cdk/core");
import { Bucket, BlockPublicAccess, BucketPolicy } from "@aws-cdk/aws-s3";
import { RemovalPolicy, CfnOutput } from "@aws-cdk/core";
import { PolicyStatement, Effect, AnyPrincipal } from "@aws-cdk/aws-iam";

export class NistMirrorStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, "bucket", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      versioned: false,
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.RETAIN
    });

    const bucketContentStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:GetObject"],
      resources: [bucket.bucketArn + "/*"],
      principals: [new AnyPrincipal()]
    });
    bucketContentStatement.addCondition("IpAddress", {
      "aws:SourceIp": "87.122.220.125/32"
    });

    const bucketStatement: PolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:ListBucket", "s3:GetBucketLocation"],
      resources: [bucket.bucketArn],
      principals: [new AnyPrincipal()]
    });
    bucketStatement.addCondition("IpAddress", {
      "aws:SourceIp": "87.122.220.125/32"
    });

    const bucketPolicy = new BucketPolicy(this, "bucketPolicy", {
      bucket: bucket
    });

    bucketPolicy.document.addStatements(
      bucketContentStatement,
      bucketStatement
    );

    new CfnOutput(this, "bucketArnOutput", {
      value: bucket.bucketArn,
      description: "Bucket ARN"
    });
  }
}
