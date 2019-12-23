'use strict';

const fs = require('fs');

const Environment = require('./Environment');

const environments = {};

class EnvironmentRepository {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
    }

    static getEnvironment(guild) {
        const id = guild.id.toString();

        let environment = environments[id];
        if (!environment) {
            environment = new Environment();
            environments[id] = environment;
            initialiseBaseCommands(environment);
            console.log('Initialised environment for server: ' + guild.name);
        }

        return environment;
    }

    static registerCommand(guild, command) {
        registerCommand(this.getEnvironment(guild), command);
    }
}

function registerCommand(environment, command) {
    environment.commands[command.name] = command;
    environment.context[command.name] = {};
}

function initialiseBaseCommands(environment) {
    const commandFiles = fs.readdirSync('./src/commands/base').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`../commands/base/${file}`);
        registerCommand(environment, command);
        console.log(`Registered base command: ${command.name}`);
    }
}

module.exports = EnvironmentRepository;