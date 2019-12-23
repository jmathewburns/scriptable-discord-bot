'use strict';

const Command = require('../commands/Command');

class Parser {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
    }

    static parseSource(name, source) {
        const strictFunctionSource = '"use strict";return (' + source + ')';
        const fun = new Function(strictFunctionSource)();
        return new Command(name, fun);
    }

    static parseJson(content) {
        return JSON.parse(content);
    }
}

module.exports = Parser;