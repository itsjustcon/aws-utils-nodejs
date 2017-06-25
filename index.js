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
} = require('./src/dynamodb-utils');

module.exports = {
    serializeDynamoDbAttributes,
    deserializeDynamoDbAttributes,
}
