'use strict';

const Discord = require('discord.js');

const EnvironmentRepository = require('./src/context/EnvironmentRepository');
const BotRequest = require('./src/commands/BotRequest');
const CommandExecutionContext = require('./src/commands/CommandExecutionContext');

const client = new Discord.Client();

const COMMAND_PREFIX = process.env.COMMAND_PREFIX;

client.on('ready', () => {
    console.log('Bot online.');
});

client.on('message', message => {
    if (message.content.startsWith(COMMAND_PREFIX)) {
        const environment = EnvironmentRepository.getEnvironment(message.channel.guild);

        processCommand(environment, message);
    }
});

function processCommand(environment, message) {
	if (!message.content.startsWith(environment.prefix) || message.author.bot) return;

    const request = new BotRequest(COMMAND_PREFIX, message);

    const command = environment.commands[request.commandName];

    if (command) {
        try {
            command.action(new CommandExecutionContext(client, request, environment));
        } catch (error) {
            handleError(error, command.action, message.channel);
        }
    }
}

function handleError(e, backendMessage, channel) {
    channel.send(`Error: ${e.message}`);
    console.log(`Error (${e.message}): ${backendMessage}`);
}

client.login(process.env.BOT_TOKEN);