'use strict';

class Environment {
    constructor() {
        this.commands = {};
        this.context = {};
        this.prefix = process.env.COMMAND_PREFIX;
    }
}

module.exports = Environment;