'use strict';

const InMemoryEnvironmentRepository = require('./InMemoryEnvironmentRepository');
const Environment = require('./Environment');
const BaseCommandLoader = require('../commands/BaseCommandLoader');

const REPOSITORY_INSTANCE = new InMemoryEnvironmentRepository();

class EnvironmentManager {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
    }

    static getEnvironment(guild) {
        let result = REPOSITORY_INSTANCE.load(guild);

        if (!result) {
            result = createNewEnvironment();
            REPOSITORY_INSTANCE.save(guild, result);
            console.log('Initialised environment for server: ' + guild.name);
        }

        return result;
    }

    static saveEnvironment(guild, environment) {
        REPOSITORY_INSTANCE.save(guild, environment);
    }
}

function createNewEnvironment() {
    const environment = new Environment(process.env.COMMAND_PREFIX);
    BaseCommandLoader.loadBaseCommands(environment);
    return environment;
}

module.exports = EnvironmentManager;