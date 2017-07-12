/**
 * test/utils.js
 * -------------
 */

const faker = require('faker');

const createRandomSizedArray = (min, max) =>
    new Array(faker.random.number(
        (arguments.length === 1)
        ? { max: min }
        : { min, max }
    )).fill(null)

const createRandomAnything = () =>
    faker.random.arrayElement([
        faker.random.number,
        faker.random.boolean,
        faker.random.alphaNumeric,
        faker.random.word,
        faker.random.words,
        () => createRandomArrayOfAnything(1, 5),
        () => createRandomObjectOfAnything(1, 5),
        createRandomInt,
        createRandomFloat,
    ]).call()
const createRandomArrayOfAnything = (min, max) =>
    createRandomSizedArray(min, max).map(createRandomAnything)
const createRandomObjectOfAnything = (min, max) =>
    createRandomSizedArray(min, max).map(createRandomAnything).reduce((memo, val) =>
        Object.assign(memo, { [faker.random.word()]: val })
    , {})

const createRandomInt = (min, max) =>
    //faker.random.number({
    //    ...((arguments.length === 1) ? { max: min } : { min, max }),
    //    precision: 1,
    //})
    faker.random.number(
        Object.assign(
            ((arguments.length === 1) ? { max: min } : { min, max }),
            { precision: 1 }
        )
    )
const createRandomFloat = (precision, min, max) =>
    //faker.random.number({
    //    ...((arguments.length === 2) ? { max: min } : { min, max }),
    //    precision: ((typeof precision === 'number') ? precision : createRandomInt(2, 9)),
    //})
    faker.random.number(
        Object.assign(
            ((arguments.length === 2) ? { max: min } : { min, max }),
            { precision: ((typeof precision === 'number') ? precision : createRandomInt(2, 9)) }
        )
    )
    //faker.random.number(
    //    (arguments.length === 0) ? { precision: createRandomInt(2, 9) }
    //    : (arguments.length === 1) ? { precision: arguments[0] }
    //    : (arguments.length === 2) ? { precision: arguments[0], max: arguments[1] }
    //    : { precision, min, max }
    //)

module.exports = {
    createRandomSizedArray,
    createRandomAnything,
    createRandomArrayOfAnything,
    createRandomObjectOfAnything,
    createRandomInt,
    createRandomFloat,
};
