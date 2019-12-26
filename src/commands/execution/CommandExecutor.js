'use strict';

const BotRequest = require('./BotRequest');
const CommandExecutionContext = require('./CommandExecutionContext');

class CommandExecutor {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
    }

    static execute(client, environment, message) {
        if (!message.content.startsWith(environment.prefix) || message.author.bot) return;

        const request = new BotRequest(environment.prefix, message);
        const command = environment.commands[request.commandName];

        if (command) {
            try {
                command.action(new CommandExecutionContext(client, request, environment));
            } catch (error) {
                handleError(error, command.action, message.channel);
            }
        }
    }
}

function handleError(e, backendMessage, channel) {
    channel.send(`Error: ${e.message}`);
    console.error(e);
}

module.exports = CommandExecutor;