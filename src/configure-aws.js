'use strict';
/**
 * configure-aws.js
 * ----------------
 */

//const AWS = require('aws-sdk');
const AWS = require('aws-sdk/global'); // import AWS without services

//AWS.config.region = AWS.config.region || process.env.AWS_DEFAULT_REGION || 'us-east-1';
//process.env.AWS_ENDPOINT_URL && AWS.config.endpoint = process.env.AWS_ENDPOINT_URL;
AWS.config.update({
    region: AWS.config.region || process.env.AWS_DEFAULT_REGION || 'us-east-1',
    endpoint: process.env.AWS_ENDPOINT_URL || AWS.config.endpoint,
});

try {
    const Promise = require('bluebird');
    AWS.config.setPromisesDependency(Promise);
} catch (err) {}

AWS.Request.prototype.then = function AWS$Request$then(...args) { return this.promise().then(...args); }
AWS.Request.prototype.catch = function AWS$Request$catch(...args) { return this.promise().catch(...args); }
//const AWS$Request = require('aws-sdk/lib/request');
//AWS$Request.prototype.then = function AWS$Request$then(...args) { return this.promise().then(...args); }
//AWS$Request.prototype.catch = function AWS$Request$catch(...args) { return this.promise().catch(...args); }
