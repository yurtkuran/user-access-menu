'use strict';

exports.yell = function (msg) {
    return msg.toUpperCase();
};

exports.foo = () => { return 'FOO!'; };

exports.bar = () => { return 'BAR!'; };

exports.iif = (field, test, yes, no) => {
    return eval(test) ? yes : no;
};

exports.foo2 = (field) => { return field; };