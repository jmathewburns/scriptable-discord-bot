'use strict';

const EnvironmentRepository = require('../../context/EnvironmentRepository');
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
    const newFunctionName = terms[1];
    const newFunctionSource = messageContent.substring(messageContent.indexOf(terms[2]), messageContent.length);
    const newFunction = Parser.parseSource(newFunctionName, newFunctionSource);
    EnvironmentRepository.registerCommand(channel.guild, newFunction);
    channel.send('Added command: ' + newFunctionName);
}