#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { config } from 'dotenv';

config();

import { SignStack } from '../lib/sign-stack';

const app = new cdk.App();
new SignStack(app, 'CeyLifeSignStack', {
    env: {
        region: "ap-south-1", //Mumbai
        account: process.env.AWS_ACCOUNT_ID!, //CeyLife account
    }
});
