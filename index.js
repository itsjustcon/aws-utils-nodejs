'use strict';
/**
 * index.js
 * --------
 *
 * @flow
 */

require('./src/configure-aws');

const {
    serializeDynamoDbAttributes,
    deserializeDynamoDbAttributes,
} = require('../../utils/aws/dynamodb-utils');

module.exports = {
    serializeDynamoDbAttributes,
    deserializeDynamoDbAttributes,
}
