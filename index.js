const Discord = require('discord.js');
const Axios = require('axios');

const Environment = require('./src/context/Environment');
const Command = require('./src/commands/Command');
const BotRequest = require('./src/commands/BotRequest');

const client = new Discord.Client();

const environments = {};

const COMMAND_PREFIX = process.env.COMMAND_PREFIX;

client.on('ready', () => {
    console.log('Bot online.');
});

client.on('message', message => {
    if (message.content.startsWith(COMMAND_PREFIX)) {
        const id = message.channel.guild.id.toString();

        let environment = environments[id];
        if (!environment) {
            environment = new Environment(initialiseBaseCommands(), {});
            environments[id] = environment;
            console.log('Initialised environment for server: ' + message.channel.guild.name);
        }

        processCommand(environment, message);
    }
});

function initialiseBaseCommands() {
    return {
        'hello': new Command('hello', function(localClient, request, environment) {
            request.message.channel.send('Hello, world!');
        }, 'Prints \'Hello, world!\'. It\'s that simple'),
        'commands': new Command('commands', function(localClient, request, environment) {
            let response = '';
            const commands = environment.commands;
            for (const name in commands) {
                const command = commands[name];
                response += ' - `' + COMMAND_PREFIX + command.name + '`';
                if (command.description) {
                    response += ':\n\t' + command.description;
                }
                response += '\n';
            }
            request.message.channel.send(response);
        }, 'Prints a list of the currently registered (base and custom) commands along with a description, if any'),
        'register': new Command('register', function(_client, request, environment) {
            registerFunctionFromInlineSource(request.message.channel, request.arguments, request.terms, environment);
        }, `
        Registers the given JavaScript function source code as a command. Parameter 1 is the desired command name, the rest of the message should be 
        the function source, not surrounded in quotes.
        Example: \`!register example function(client, request, environment) { request.message.channel.send("Example"); }\`
        `),
    };
}

function registerFunctionFromInlineSource(channel, messageContent, terms, environment) {
    const command = terms[1];
    const rawFunction = messageContent.substring(messageContent.indexOf(terms[2]), messageContent.length);
    try {
        registerFunction(rawFunction, command, environment);
        channel.send('Added command: ' + command);
    } catch (error) {
        handleError(error, rawFunction, channel);
    }
}

function registerFunction(functionSource, functionName, environment) {
    const strictFunctionSource = '"use strict";return (' + functionSource + ')';
    const fun = new Function(strictFunctionSource)();
    environment.commands[functionName] = new Command(functionName, fun);
    environment.context[functionName] = {};
}

function processCommand(environment, message) {
    const request = new BotRequest(COMMAND_PREFIX, message);

    const command = environment.commands[request.commandName];

    if (command) {
        try {
            command.action(client, request, environment);
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