import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle,
  haveResource,
  haveResourceLike,
} from "@aws-cdk/assert";
import cdk = require("@aws-cdk/core");
import { Stack } from "@aws-cdk/core";
import { NistMirrorStack } from "../lib/nist_mirror-stack";

test("S3 bucket is not public accessible ", () => {
  const stack = new Stack();

  const s = new NistMirrorStack(stack, "stack");

  expectCDK(s).to(
    haveResourceLike("AWS::S3::Bucket", {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    })
  );
});
