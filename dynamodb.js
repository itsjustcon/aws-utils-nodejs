'use strict';
/**
 * dynamodb.js
 * -----------
 *
 * @flow
 */

const _ = require('lodash');

const DynamoDbAttributeKeys = [
    'B', // Buffer | string
    'BOOL', // boolean
    'BS', // Array<Buffer|string>
    'L', // Array<AttributeValue> - nested/recursive array of AttributeValues
    'M', // { [key:string]: AttributeValue } - nested/recursive map of AttributeValues
    'N', // number - single number (in string form)
    'NS', // Array<number> - many numbers (in string form)
    'NULL', // boolean
    'S', // string
    'SS', // Array<string>
];
function isDynamoDbAttributeValue(value/*: any*/) /*: boolean*/ {
    return (
        typeof value === 'object' &&
        _.size(value) === 1 &&
        DynamoDbAttributeKeys.includes(Object.keys(value)[0])
    )
}

function serializeDynamoDbAttributeValue(value/*: any*/) /*: object*/ {
    if (typeof value === 'boolean') {
        return { BOOL: value }
    } else if (typeof value === 'number') {
        return { N: value.toString() }
    } else if (typeof value === 'string') {
        return { S: value }
    } else if (Array.isArray(value)) {
        if (value.every((val) => typeof val === 'number')) {
            return { NS: value.map((val) => val.toString()) }
        } else if (value.every((val) => typeof val === 'string')) {
            return { SS: value }
        } else if (value.every((val) => Buffer.isBuffer(val) || typeof val === 'string')) {
            return { BS: value }
        } else {
            return { L: value.map(serializeDynamoDbAttributeValue) } // nested/recursive AttributeValue
        }
    } else if (Buffer.isBuffer(value)) {
        return { B: value }
    } else if (_.isPlainObject(value)) {
        //if (Object.keys(value).every((val) => DynamoDbAttributeKeys.includes(val))) {
        if (isDynamoDbAttributeValue(value)) {
            return value;
        } else {
            return { M: _.mapValues(value, serializeDynamoDbAttributeValue) } // nested/recursive AttributeValue
        }
    } else if (value == void 0) {
        return { NULL: true/*value*/ }
    }
}
function deserializeDynamoDbAttributeValue(attributeValue/*: object*/) /*: any*/ {
    if (Array.isArray(attributeValue)) {
        return attributeValue.map(deserializeDynamoDbAttributeValue);
    } else {
        if (isDynamoDbAttributeValue(attributeValue)) {
            const [ key, val ] = Object.entries(attributeValue)[0];
            const parseBuffer = (buffer/*: Buffer | string*/)/*: Buffer*/ =>
                Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
            const parseNumber = (number/*: number | string*/)/*: number*/ =>
                (typeof val === 'number') ? val
                : (typeof val === 'string') ?
                    (/^-?[0-9]$/.test(val) ? parseInt(val) : parseFloat(val))
                : NaN//val
            switch (key) {
                case 'B': return parseBuffer(val);
                case 'BOOL': return val;//return !!val;//return val === true;
                case 'BS': return val.map(parseBuffer);
                case 'L': return val.map(deserializeDynamoDbAttributeValue);
                case 'M': return _.mapValues(val, deserializeDynamoDbAttributeValue);
                case 'N': return parseNumber(val);
                case 'NS': return val.map(parseNumber);
                case 'NULL': return null;
                case 'S': return val;
                case 'SS': return val;
                // this will never execute but it's here for sanity
                default: throw new Error(`deserializeDynamoDbAttributeValue() called with an invalid argument: ${attributeValue}`);
            }
        } else {
            //throw new Error(`deserializeDynamoDbAttributeValue() called with an invalid argument: ${attributeValue}`);
            return _.mapValues(attributeValue, deserializeDynamoDbAttributeValue);
        }
    }
}
function serializeDynamoDbAttributes(attributes/*: object*/) /*: object*/ {
    return _.mapValues(attributes, serializeDynamoDbAttributeValue);
}
function deserializeDynamoDbAttributes(attributes/*: object*/) /*: object*/ {
    return _.mapValues(attributes, deserializeDynamoDbAttributeValue);
}

module.exports = {
    serializeDynamoDbAttributeValue,
    deserializeDynamoDbAttributeValue,
    serializeDynamoDbAttributes,
    deserializeDynamoDbAttributes,
};
