/**
 * dynamodb-tests.js
 * -----------------
 * USAGE:
 *   mocha test/dynamodb-tests.js
 *   mocha --watch dynamodb.js test/dynamodb-tests.js
 */

const _ = require('lodash');
const { expect } = require('chai');
const faker = require('faker');

const {
    serializeDynamoDbAttributeValue,
    deserializeDynamoDbAttributeValue,
    serializeDynamoDbAttributes,
    deserializeDynamoDbAttributes,
    createDynamoDbFilterExpression,
} = require('../dynamodb');

const {
    createRandomSizedArray,
    createRandomAnything,
    createRandomArrayOfAnything,
    createRandomObjectOfAnything,
    createRandomInt,
    createRandomFloat,
} = require('./utils');



describe('dynamodb', () => {

    describe('serializeDynamoDbAttributeValue()', () => {

        context('B : Buffer | string', () => {
            it('should properly serialize a Buffer', () => {
                const values = [
                    Buffer.alloc(99),
                    Buffer.from('hello world'),
                ];
                for (const value of values) {
                    const result = serializeDynamoDbAttributeValue(value);
                    expect(result).to.be.an('object');
                    expect(Object.keys(result)).to.have.lengthOf(1);
                    expect(result).to.deep.equal({ B: value });
                    expect(result).to.have.property('B').that.is.an.instanceof(Buffer).and.equals(value);
                }
            })
            it('should return null for an empty Buffer', () => {
                const value = Buffer.alloc(0);
                const result = serializeDynamoDbAttributeValue(value);
                expect(result).to.be.an('object');
                expect(Object.keys(result)).to.have.lengthOf(1);
                expect(result).to.deep.equal({ NULL: true });
                expect(result).to.have.property('NULL').that.is.a('boolean').and.equals(true);
            })
        })
        context('BOOL : boolean', () => {
            it('should properly serialize a boolean', () => {
                const values = [ true, false ];
                for (const value of values) {
                    const result = serializeDynamoDbAttributeValue(value);
                    expect(result).to.be.an('object');
                    expect(Object.keys(result)).to.have.lengthOf(1);
                    expect(result).to.deep.equal({ BOOL: value });
                    expect(result).to.have.property('BOOL').that.is.a('boolean').and.equals(value);
                }
            })
        })
        context('BS : Array<Buffer|string>', () => {
            it('should properly serialize an array of Buffers', () => {
                const value = [
                    Buffer.alloc(99),
                    Buffer.from('hello world'),
                ];
                const result = serializeDynamoDbAttributeValue(value);
                expect(result).to.be.an('object');
                expect(Object.keys(result)).to.have.lengthOf(1);
                expect(result).to.have.property('BS').that.is.a('array').with.lengthOf(value.length).and.equal(value);
            })
            it('should properly serialize an array of Buffers & strings', () => {
                const value = createRandomSizedArray(9, 99).map((val, idx) =>
                    (idx % 2) ? Buffer.from(faker.random.words()) : faker.random.words()
                );
                const result = serializeDynamoDbAttributeValue(value);
                expect(result).to.be.an('object');
                expect(Object.keys(result)).to.have.lengthOf(1);
                expect(result).to.have.property('BS').that.is.a('array').with.lengthOf(value.length).and.equal(value);
            })
        })
        context('L : Array<AttributeValue> - nested/recursive array of AttributeValues', () => {
            it('should properly serialize an array of mixed content', () => {
                const value = createRandomArrayOfAnything(19, 49);
                const result = serializeDynamoDbAttributeValue(value);
                expect(result).to.be.an('object');
                expect(Object.keys(result)).to.have.lengthOf(1);
                expect(result).to.have.property('L').that.is.a('array');
                for (const obj of result.L) {
                    expect(obj).to.be.an('object');
                    expect(Object.keys(obj)).to.have.lengthOf(1);
                }
            })
        })
        context('M : { [key:string]: AttributeValue } - nested/recursive map of AttributeValues', () => {
            it('should properly serialize an Object of mixed content', () => {
                const value = createRandomObjectOfAnything(19, 49);
                const result = serializeDynamoDbAttributeValue(value);
                expect(result).to.be.an('object');
                expect(Object.keys(result)).to.have.lengthOf(1);
                expect(result).to.have.property('M').that.is.a('object').and.has.all.keys(Object.keys(value));
            })
        })
        context('N : number - single number (in string form)', () => {
            it('should properly serialize an integer', () => {
                const values = createRandomSizedArray(49, 199).map(() => createRandomInt());
                for (const value of values) {
                    const result = serializeDynamoDbAttributeValue(value);
                    expect(result).to.be.an('object');
                    expect(Object.keys(result)).to.have.lengthOf(1);
                    //expect(result).to.deep.equal({ N: ''+value });
                    expect(result).to.have.property('N').that.is.a('string').and.equals(''+value);
                }
            })
            it('should properly serialize a floating-point number', () => {
                const values = createRandomSizedArray(49, 199).map(() => createRandomFloat());
                for (const value of values) {
                    const result = serializeDynamoDbAttributeValue(value);
                    expect(result).to.be.an('object');
                    expect(Object.keys(result)).to.have.lengthOf(1);
                    //expect(result).to.deep.equal({ N: ''+value });
                    expect(result).to.have.property('N').that.is.a('string').and.equals(''+value);
                }
            })
            it('should handle Infinity', () => {
                const value = Infinity;
                const result = serializeDynamoDbAttributeValue(value);
                expect(result).to.be.an('object');
                expect(Object.keys(result)).to.have.lengthOf(1);
                //expect(result).to.deep.equal({ N: ''+value });
                expect(result).to.have.property('N').that.is.a('string').and.equals(''+value);
            })
        })
        context('NS : Array<number> - many numbers (in string form)', () => {
            it('should properly serialize an array of integers', () => {
                const value = createRandomSizedArray(49, 199).map(() => createRandomInt());
                const result = serializeDynamoDbAttributeValue(value);
                expect(result).to.be.an('object');
                expect(Object.keys(result)).to.have.lengthOf(1);
                expect(result).to.have.property('NS').that.is.a('array').with.lengthOf(value.length);
                for (let i = 0; i < result.NS.length; i++) {
                    const str = result.NS[i];
                    expect(str).to.be.a('string');
                    expect(parseInt(str)).to.equal(value[i]);
                }
            })
            it('should properly serialize an array of floating-point numbers', () => {
                const value = createRandomSizedArray(49, 199).map(() => createRandomFloat());
                const result = serializeDynamoDbAttributeValue(value);
                expect(result).to.be.an('object');
                expect(Object.keys(result)).to.have.lengthOf(1);
                expect(result).to.have.property('NS').that.is.a('array').with.lengthOf(value.length);
                for (let i = 0; i < result.NS.length; i++) {
                    const str = result.NS[i];
                    expect(str).to.be.a('string');
                    expect(parseFloat(str)).to.equal(value[i]);
                }
            })
        })
        context('NULL : boolean', () => {
            it('should properly serialize undefined', () => {
                const value = undefined;
                const result = serializeDynamoDbAttributeValue(value);
                expect(result).to.be.an('object');
                expect(Object.keys(result)).to.have.lengthOf(1);
                expect(result).to.have.property('NULL').that.equals(true);
            })
            it('should properly serialize null', () => {
                const value = null;
                const result = serializeDynamoDbAttributeValue(value);
                expect(result).to.be.an('object');
                expect(Object.keys(result)).to.have.lengthOf(1);
                expect(result).to.have.property('NULL').that.equals(true);
            })
            it('should properly serialize void 0', () => {
                const value = void 0;
                const result = serializeDynamoDbAttributeValue(value);
                expect(result).to.be.an('object');
                expect(Object.keys(result)).to.have.lengthOf(1);
                expect(result).to.have.property('NULL').that.equals(true);
            })
        })
        context('S : string', () => {
            it('should properly serialize a string', () => {
                const values = createRandomSizedArray(49, 199).map(() => faker.random.words());
                for (const value of values) {
                    const result = serializeDynamoDbAttributeValue(value);
                    expect(result).to.be.an('object');
                    expect(Object.keys(result)).to.have.lengthOf(1);
                    expect(result).to.deep.equal({ S: value });
                    expect(result).to.have.property('S').that.is.a('string').and.equals(value);
                }
            })
            it('should return null for an empty string', () => {
                const value = '';
                const result = serializeDynamoDbAttributeValue(value);
                expect(result).to.be.an('object');
                expect(Object.keys(result)).to.have.lengthOf(1);
                expect(result).to.deep.equal({ NULL: true });
                expect(result).to.have.property('NULL').that.is.a('boolean').and.equals(true);
            })
        })
        context('SS : Array<string>', () => {
            it('should properly serialize an array of strings', () => {
                const value = createRandomSizedArray(9, 99).map(() => faker.random.words());
                const result = serializeDynamoDbAttributeValue(value);
                expect(result).to.be.an('object');
                expect(Object.keys(result)).to.have.lengthOf(1);
                expect(result).to.have.property('SS').that.is.a('array').with.lengthOf(value.length).and.equal(value);
            })
            it('should return null for an empty array', () => {
                const value = [];
                const result = serializeDynamoDbAttributeValue(value);
                expect(result).to.be.an('object');
                expect(Object.keys(result)).to.have.lengthOf(1);
                expect(result).to.deep.equal({ NULL: true });
                expect(result).to.have.property('NULL').that.is.a('boolean').and.equals(true);
            })
            it('should return null for an array of empty strings', () => {
                const value = createRandomSizedArray(9, 99).fill('');
                const result = serializeDynamoDbAttributeValue(value);
                expect(result).to.be.an('object');
                expect(Object.keys(result)).to.have.lengthOf(1);
                expect(result).to.deep.equal({ NULL: true });
                expect(result).to.have.property('NULL').that.is.a('boolean').and.equals(true);
            })
        })

    })

    describe.skip('deserializeDynamoDbAttributeValue', () => {

        context.skip('B : Buffer | string', () => {
            it('should ', () => {})
        })
        context.skip('BOOL : boolean', () => {
            it('should ', () => {})
        })
        context.skip('BS : Array<Buffer|string>', () => {
            it('should ', () => {})
        })
        context.skip('L : Array<AttributeValue> - nested/recursive array of AttributeValues', () => {
            it('should ', () => {})
        })
        context.skip('M : { [key:string]: AttributeValue } - nested/recursive map of AttributeValues', () => {
            it('should ', () => {})
        })
        context.skip('N : number - single number (in string form)', () => {
            it('should ', () => {})
        })
        context.skip('NS : Array<number> - many numbers (in string form)', () => {
            it('should ', () => {})
        })
        context.skip('NULL : boolean', () => {
            it('should ', () => {})
        })
        context.skip('S : string', () => {
            it('should ', () => {})
        })
        context.skip('SS : Array<string>', () => {
            it('should ', () => {})
        })

    })

    describe.skip('serializeDynamoDbAttributes', () => {})

    describe.skip('deserializeDynamoDbAttributes', () => {})

    describe.skip('createDynamoDbFilterExpression', () => {})

})
