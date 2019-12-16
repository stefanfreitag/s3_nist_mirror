#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { NistMirrorStack } from '../lib/nist_mirror-stack';

const app = new cdk.App();
new NistMirrorStack(app, 'NistMirrorStack');
