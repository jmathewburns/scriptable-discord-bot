const Discord = require('discord.js');
const axios = require('axios');

const client = new Discord.Client();

var scripts = {};
var context = {}

client.on('ready', () => {
    console.log('Bot online.');
});

client.on('message', message => {
    let content = message.content;
    let terms = content.split(' ');
    let currentCommand = terms[0];

    let channel = message.channel;

    if (content === '!hello') {
        channel.send('Hello, world!')
    } else if (content === '!commands') {
        let response =  "!addfile\n!addstring\n!hello\n";

        for (field in scripts) {
            response += field + "\n";
        }

        channel.send(response);
    } else if (content.startsWith('!addfile')) {
        registerFunctionFromFile(channel, terms);
    } else if (content.startsWith('!addstring')) {
        registerFunctionFromInlineSource(channel, content, terms);
    } else if (scripts[currentCommand]) {
        let arguments = content.substring(currentCommand.length, content.length);
        try {
            scripts[currentCommand](client, message, arguments, context);
        } catch (e) {
            handleError(e, scripts[currentCommand].toSource(), channel)
        }
    }
});

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
        channel.send("Added command: " + command);
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

function handleError(e, backendMessage, channel) {
    channel.send(`Error: ${e.message}`);
    console.log(`Error (${e.message}): ${backendMessage}`);
}

function registerFunction(functionCode, functionName) {
    let strictFunctionCode = '"use strict";return (' + functionCode + ')';
    let fun = new Function(strictFunctionCode)();
    scripts[functionName] = fun;
}

client.login(process.env.BOT_TOKEN);