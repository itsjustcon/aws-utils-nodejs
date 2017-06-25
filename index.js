'use strict';
/**
 * index.js
 * --------
 *
 * @flow
 */

require('./configure');

const {
    serializeDynamoDbAttributes,
    deserializeDynamoDbAttributes,
} = require('./dynamodb-utils');

module.exports = {
    serializeDynamoDbAttributes,
    deserializeDynamoDbAttributes,
}
