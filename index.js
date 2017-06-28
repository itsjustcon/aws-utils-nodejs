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
} = require('./dynamodb');

module.exports = {
    serializeDynamoDbAttributes,
    deserializeDynamoDbAttributes,
    createDynamoDbFilterExpression,
}
