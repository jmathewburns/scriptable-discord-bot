'use strict';

class CommandExecutionContext {
    constructor(client, request, environment) {
        this.client = client;
        this.request = request;
        this.environment = environment;
    }
}

module.exports = CommandExecutionContext;