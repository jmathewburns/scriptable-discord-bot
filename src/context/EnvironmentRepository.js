'use strict';

const Environment = require('./Environment');

const environments = {};

class EnvironmentRepository {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
    }

    static getEnvironment(guild, baseCommandsSupplier) {
        const id = guild.id.toString();

        let environment = environments[id];
        if (!environment) {
            if (!baseCommandsSupplier) {
                throw new Error('environment does not exist and cannot be created');
            }
            environment = new Environment(baseCommandsSupplier(), {});
            environments[id] = environment;
            console.log('Initialised environment for server: ' + guild.name);
        }

        return environment;
    }

    static registerCommand(guild, command) {
        const environment = this.getEnvironment(guild);
        environment.commands[command.name] = command;
        environment.context[command.name] = {};
    }
}

module.exports = EnvironmentRepository;