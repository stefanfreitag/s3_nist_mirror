import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import NistMirror = require('../lib/nist_mirror-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new NistMirror.NistMirrorStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});