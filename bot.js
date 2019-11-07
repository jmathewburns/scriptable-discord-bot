const Discord = require('discord.js');
const axios = require('axios');

const client = new Discord.Client();

var scripts = {};

client.on('ready', () => {
    console.log('Bot online.');
});

client.on('message', message => {
    let content = message.content;
    terms = content.split(' ');
    let currentCommand = terms[0];

    if (message.content === '!hello') {
        message.reply('Hello, world!')
    } else if (message.content.startsWith('!addfile')) {
        let command = terms[1];

        let url = terms[2];

        console.log(url);

        axios.get(url).then(response => {
            console.log("Success: " + response.data)
            let code = '"use strict";return (' + response.data + ')';
            addScriptCommand(code, command, message)
        }).catch(error => {
            console.log("Error: " + error.data);
            message.reply("Error: " + error.data)
        });
    } else if (message.content.startsWith('!addstring')) {
        let command = terms[1];

        let rawFunction = content.substring(content.indexOf(terms[2]), content.length);

        let code = '"use strict";return (' + rawFunction + ')';

        addScriptCommand(code, command, message);
    }
    
    else if (scripts[currentCommand]) {
        console.log(scripts[currentCommand]);
        scripts[currentCommand](client, message, content.substring(currentCommand.length, content.length));
    }
});

client.login(process.env.BOT_TOKEN);

function addScriptCommand(code, command, message) {
    try {
        let fun = new Function(code)();
        scripts[command] = fun;
        message.reply("Added command: " + command);
    }
    catch (e) {
        message.channel.send("Error: " + e.message);
        console.log(`Error (${e.message}): ${code}`);
    }
}
