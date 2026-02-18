#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';

import { SignStack } from '../lib/sign-stack';

const app = new cdk.App();
new SignStack(app, 'CeyLifeSignStack', {
});
