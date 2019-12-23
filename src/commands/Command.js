'use strict';

class Command {
    constructor(name, action, description) {
        this.name = name;
        this.action = action;
        this.description = description;
    }
}

module.exports = Command;