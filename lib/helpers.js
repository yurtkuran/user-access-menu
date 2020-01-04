'use strict';

exports.yell = function (msg) {
    return msg.toUpperCase();
};

exports.foo = () => { return 'FOO!'; };

exports.bar = () => { return 'BAR!'; };

exports.iif = (field, test, yes, no) => {
    return eval(test) ? yes : no;
};

exports.iffselected = (field1, field2) => {
    return field1 === field2 ? 'selected' : '';
};

exports.foo2 = (field) => { return field; };