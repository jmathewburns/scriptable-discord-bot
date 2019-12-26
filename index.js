'use strict';

const Discord = require('discord.js');

const EnvironmentManager = require('./src/context/EnvironmentManager');
const CommandExecutor = require('./src/commands/execution/CommandExecutor');

const client = new Discord.Client();

client.on('ready', () => {
    console.log('Bot online.');
});

client.on('message', message => {
    const environment = EnvironmentManager.getEnvironment(message.channel.guild);
    CommandExecutor.execute(client, environment, message);
});

client.login(process.env.BOT_TOKEN);