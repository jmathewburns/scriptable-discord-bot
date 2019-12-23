'use strict';

module.exports = {
    name: 'commands',
    description: 'Prints a list of the currently registered (base and custom) commands along with a description, if any',
    action: function(context) {
        let response = '';
            const commands = context.environment.commands;
            for (const name in commands) {
                const command = commands[name];
                response += ' - `' + context.environment.prefix + command.name + '`';
                if (command.description) {
                    response += ':\n\t' + command.description;
                }
                response += '\n';
            }
            context.request.message.channel.send(response);
    },
};