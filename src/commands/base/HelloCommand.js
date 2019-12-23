'use strict';

module.exports = {
    name: 'hello',
    description: 'Prints \'Hello, world!\'. It\'s that simple',
    action: function(context) {
        context.request.message.channel.send('Hello, world!');
    },
};