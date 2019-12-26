'use strict';

class Environment {
    constructor(prefix) {
        this.commands = {};
        this.context = {};
        this.prefix = prefix;
    }

    registerCommand(command) {
        this.commands[command.name] = command;
        this.context[command.name] = {};
    }
}

module.exports = Environment;