const Discord = require('discord.js');
const axios = require('axios');

const client = new Discord.Client();

const environments = {};

const COMMAND_PREFIX = process.env.COMMAND_PREFIX;

class BotRequest {
    constructor(message) {
        const messageContent = message.content;
        this.terms = messageContent.split(' ');
        this.commandName = this.terms[0].substring(COMMAND_PREFIX.length);
        this.arguments = messageContent.substring(this.commandName.length).trim();
        this.message = message;
    }
}

class Command {
    constructor(name, action, description) {
        this.name = name;
        this.action = action;
        this.description = description;
    }
}

class Environment {
    constructor(commands, context) {
        this.commands = commands;
        this.context = context;
    }
}


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
        'registerfile': new Command('registerfile', function(_client, request, environment) {
            registerFunctionFromFile(request.message.channel, request.terms, environment);
        }, `
        Registers the given file as a command. Parameter 1 is the desired command name, parameter 2 is a URL to the file. File extension does not matter.
        Example: \`!registerfile example https://example.org/path/to/json/function.js\`
        `),
        'registerinline': new Command('registerinline', function(_client, request, environment) {
            registerFunctionFromInlineSource(request.message.channel, request.arguments, request.terms, environment);
        }, `
        Registers the given JavaScript function source code as a command. Parameter 1 is the desired command name, the rest of the message should be 
        the function source, not surrounded in quotes.
        Example: \`!registerinline example function(client, request, environment) { request.message.channel.send("Example"); }\`
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

function registerFunctionFromFile(channel, terms, environment) {
    const command = terms[1];
    const url = terms[2];
    let fileContent;
    try {
        fileContent = downloadFile(url);
        registerFunction(fileContent, command, environment);
        channel.send('Added command: ' + COMMAND_PREFIX + command);
    } catch (error) {
        if (!fileContent) {
            fileContent = url;
        }
        handleError(error, fileContent, channel);
    }
}

function downloadFile(url) {
    let content;
    let error;

    axios.get(url).then(response => {
        content = response.data;
    }).catch(e => {
        error = e;
    });

    if (error) {
        throw error;
    }

    return content;
}

function registerFunction(functionSource, functionName, environment) {
    const strictFunctionSource = '"use strict";return (' + functionSource + ')';
    const fun = new Function(strictFunctionSource)();
    environment.commands[functionName] = new Command(functionName, fun);
    environment.context[functionName] = {};
}

function processCommand(environment, message) {
    const request = new BotRequest(message);

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