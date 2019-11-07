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
    terms = content.split(' ');
    let currentCommand = terms[0];

    let channel = message.channel;

    if (message.content === '!hello') {
        channel.send('Hello, world!')
    } else if (message.content.startsWith('!addfile')) {
        let command = terms[1];
        let url = terms[2];

        try {
            let content = downloadFile(url);
            registerFunction(content, command);
            channel.send("Added command: " + command);
        } catch (e) {
            if (!content) {
                content = url;
            }
            handleError(e, content, channel);
        }
    } else if (message.content.startsWith('!addstring')) {
        let command = terms[1];

        let rawFunction = content.substring(content.indexOf(terms[2]), content.length);

        try {
            registerFunction(rawFunction, command);
            message.channel.send("Added command: " + command);
        } catch (e) {
            handleError(e, rawFunction, channel);
        }
    }
    
    else if (scripts[currentCommand]) {
        let arguments = content.substring(currentCommand.length, content.length);
        try {
            scripts[currentCommand](client, message, arguments, context);
        } catch (e) {
            handleError(e, scripts[currentCommand].toSource(), channel)
        }
    }
});

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

function handleError(error, backendMessage, channel) {
    channel.send(`Error: ${e.message}`);
    console.log(`Error (${e.message}): ${backendMessage}`);
}

function registerFunction(functionCode, functionName) {
    let strictFunctionCode = '"use strict";return (' + functionCode + ')';
    let fun = new Function(strictFunctionCode)();
    scripts[functionName] = fun;
}

client.login(process.env.BOT_TOKEN);