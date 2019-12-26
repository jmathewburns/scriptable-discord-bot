'use strict';

const EnvironmentManager = require('../../context/EnvironmentManager');
const Parser = require('../../utils/Parser');

module.exports = {
    name: 'register',
    description: `
    Registers the given JavaScript function source code as a command. Parameter 1 is the desired command name, the rest of the message should be 
    the function source, not surrounded in quotes.
    Example: \`!register example function(context) { context.request.message.channel.send("Example"); }\`
    `,
    action: function(context) {
        registerFunctionFromInlineSource(context.request.message.channel, context.request.arguments, context.request.terms);
    },
};

function registerFunctionFromInlineSource(channel, messageContent, terms) {
    const newFunction = parseInlineSource(messageContent, terms);

    registerFunction(channel.guild, newFunction);

    channel.send('Added command: ' + newFunction.name);
}

function parseInlineSource(messageContent, terms) {
    const newFunctionName = terms[1];
    const newFunctionSource = messageContent.substring(messageContent.indexOf(terms[2]), messageContent.length);
    return Parser.parseSource(newFunctionName, newFunctionSource);
}

function registerFunction(guild, newFunction) {
    const environment = EnvironmentManager.getEnvironment(guild);
    environment.registerCommand(newFunction);
    EnvironmentManager.saveEnvironment(guild, environment);
}