'use strict';

class BotRequest {
    constructor(prefix, message) {
        const messageContent = message.content;
        this.terms = messageContent.split(' ');
        this.commandName = this.terms[0].substring(prefix.length);
        this.arguments = messageContent.substring(this.commandName.length).trim();
        this.message = message;
    }
}

module.exports = BotRequest;