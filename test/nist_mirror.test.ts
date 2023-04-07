import { App } from 'aws-cdk-lib';
import * as assertions from 'aws-cdk-lib/assertions';
import { NistMirrorStack } from '../src';

test('S3 bucket is not public accessible ', () => {
  const app = new App();
  const stack = new NistMirrorStack(app, 'stack');

  assertions.Template.fromStack(stack).hasResourceProperties('AWS::S3::Bucket', {
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      BlockPublicPolicy: true,
      IgnorePublicAcls: true,
      RestrictPublicBuckets: true,
    },
  });

});
