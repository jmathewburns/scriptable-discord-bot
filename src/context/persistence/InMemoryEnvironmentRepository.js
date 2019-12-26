'use strict';

const environments = {};

class InMemoryEnvironmentRepository {
    load(guild) {
        return environments[identifier(guild)];
    }

    save(guild, environment) {
        environments[identifier(guild)] = environment;
    }
}

function identifier(guild) {
    return guild.id.toString();
}

module.exports = InMemoryEnvironmentRepository;