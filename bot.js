const Discord = require('discord.js');
const axios = require('axios');

const client = new Discord.Client();

var commands = {};
var context = {}

const COMMAND_PREFIX = process.env.COMMAND_PREFIX;

class BotRequest {
    constructor(message) {
        let messageContent = message.content;
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

var commands = {
    "hello": new Command("hello", function(client, request, context) {
        request.message.channel.send("Hello, world!");
    }, "Prints 'Hello, world!'. It's that simple"), 
    "commands": new Command("commands", function(client, request, context) {
        let response = "";
        for (const name in commands) {
            let command = commands[name];
            response += " - `" + COMMAND_PREFIX + command.name + "`";
            if (command.description) {
                response += ":\n\t" + command.description;
            }
            response += "\n";
        }

        request.message.channel.send(response);
    }, "Prints a list of the currently registered (base and custom) commands along with a description, if any"),
    "registerfile": new Command("registerfile", function(client, request, context) {
        registerFunctionFromFile(request.message.channel, request.terms);
    }, `Registers the given file as a command. Parameter 1 is the desired command name, parameter 2 is a URL to the file. File extension does not matter. \n
    Example: \`!registerfile example https://example.org/path/to/json/function.js\``),
    "registerinline": new Command("registerinline", function(client, request, context) {
        registerFunctionFromInlineSource(request.message.channel, request.arguments, request.terms);
    }, `Registers the given JavaScript function source code as a command. Parameter 1 is the desired command name, the rest of the message should be the function source,
    not surrounded in quotes.\n
    Example: \`!registerinline example function(client, request, context) { request.message.channel.send("Example"); }\``)
}

function registerFunctionFromInlineSource(channel, messageContent, terms) {
    let command = terms[1];
    let rawFunction = messageContent.substring(messageContent.indexOf(terms[2]), messageContent.length);
    try {
        registerFunction(rawFunction, command);
        channel.send("Added command: " + command);
    } catch (error) {
        handleError(error, rawFunction, channel);
    }
}

function registerFunctionFromFile(channel, terms) {
    let command = terms[1];
    let url = terms[2];
    try {
        let fileContent = downloadFile(url);
        registerFunction(fileContent, command);
        channel.send("Added command: " + COMMAND_PREFIX + command);
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
        content = response.data
    }).catch(e => {
        error = e
    });

    if (error) {
        throw error;
    }

    return content;
}

function registerFunction(functionSource, functionName) {
    let strictFunctionSource = '"use strict";return (' + functionSource + ')';
    let fun = new Function(strictFunctionSource)();
    commands[functionName] = new Command(functionName, fun);
    context[functionName] = {};
}

client.on('ready', () => {
    console.log('Bot online.');
});

client.on('message', message => {
    if (message.content.startsWith(COMMAND_PREFIX)) {
        let request = new BotRequest(message);

        let command = commands[request.commandName];
        if (command) {
            try {
                command.action(client, request, context);
            } catch (error) {
                handleError(error, command.action.toSource(), message.channel)
            }
        }
    }
});

function handleError(e, backendMessage, channel) {
    channel.send(`Error: ${e.message}`);
    console.log(`Error (${e.message}): ${backendMessage}`);
}

client.login(process.env.BOT_TOKEN);