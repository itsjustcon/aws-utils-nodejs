'use strict';
/**
 * index.js
 * --------
 *
 * @flow
 */

require('./configure-aws');

const {
    serializeDynamoDbAttributes,
    deserializeDynamoDbAttributes,
} = require('./dynamodb-utils');

module.exports = {
    serializeDynamoDbAttributes,
    deserializeDynamoDbAttributes,
}
