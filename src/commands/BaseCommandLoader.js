'use strict';

const fs = require('fs');

class BaseCommandLoader {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
    }

    static loadBaseCommands(environment) {
        const commandFiles = fs.readdirSync('./src/commands/base').filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`../commands/base/${file}`);
            environment.registerCommand(command);
            console.debug(`Registered base command: ${command.name}`);
        }
    }
}

module.exports = BaseCommandLoader;