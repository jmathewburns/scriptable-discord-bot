const Discord = require('discord.js');

const EnvironmentRepository = require('./src/context/EnvironmentRepository');
const Command = require('./src/commands/Command');
const BotRequest = require('./src/commands/BotRequest');
const Parser = require('./src/utils/Parser');

const client = new Discord.Client();

const COMMAND_PREFIX = process.env.COMMAND_PREFIX;

client.on('ready', () => {
    console.log('Bot online.');
});

client.on('message', message => {
    if (message.content.startsWith(COMMAND_PREFIX)) {
        const environment = EnvironmentRepository.getEnvironment(message.channel.guild, initialiseBaseCommands);

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
            registerFunctionFromInlineSource(request.message.channel, request.arguments, request.terms);
        }, `
        Registers the given JavaScript function source code as a command. Parameter 1 is the desired command name, the rest of the message should be 
        the function source, not surrounded in quotes.
        Example: \`!register example function(client, request, environment) { request.message.channel.send("Example"); }\`
        `),
    };
}

function registerFunctionFromInlineSource(channel, messageContent, terms) {
    const newFunctionName = terms[1];
    const newFunctionSource = messageContent.substring(messageContent.indexOf(terms[2]), messageContent.length);
    try {
        const newFunction = Parser.parseSource(newFunctionName, newFunctionSource);
        EnvironmentRepository.registerCommand(channel.guild, newFunction);
        channel.send('Added command: ' + newFunctionName);
    } catch (error) {
        handleError(error, newFunctionSource, channel);
    }
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