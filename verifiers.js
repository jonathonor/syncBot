import { colorLog, debugLog } from "./helpers.js";
import config from "./config.js";
import { client } from "./globals.js";

// Verifies that the config file is correctly configured based on types expected
export const verifyConfig = () => {
    console.log("\x1b[91mError \x1b[93mWarning \x1b[94mInfo\x1b[0m")

    let hasError = false;
    colorLog('info', 'VERIFYING CONFIG FILE');

    //errors
    if (!config.applicationId) {
        hasError = true;
        colorLog('error', 'Config applicationId missing, please check.');
    }

    if (!config.token) {
        hasError = true;
        colorLog('error', 'Config token missing, please add it.');
    }

    if (!config.mainServer) {
        hasError = true;
        colorLog('error', 'Config mainserver missing, please check.');
    }

    if (!config.syncedServers || (config.syncedServers && !Array.isArray(config.syncedServers))) {
        hasError = true;
        colorLog('error', 'Config syncedServers missing or not Array, please verify it exists and matches structure "syncedServers": ["123456789123456789"], ');
    }

    // warnings
    if (!config.logChannelId) {
        colorLog('warning', 'logChannelId not found in config file, logs will not be sent.');
    }

    if (!config.allowedRoleName) {
        if (!config.allowedRoleId) {
            colorLog('warning', 'allowedRoleName and allowedRoleId not found in config file, only server owner can use commands.');
        }
        colorLog('warning', 'allowedRoleName not found in config file, only server owner can use commands or user with allowedRoleId.');
    }

    if (!config.allowedRoleId) {
        if (!config.allowedRoleName) {
            colorLog('warning', 'allowedRoleId and allowedRoleName not found in config file, only server owner can use commands.');
        }
        colorLog('warning', 'allowedRoleId not found in config file, only server owner can use commands or user with allowedRoleName.');
    }

    if (hasError) {
        colorLog('error', 'CONFIG FILE HAD ERROR, EXITING!');
        process.exit(1);
    } else {
        colorLog('info', 'FINISHED VERIFYING CONFIG FILE');
    }
}

// Verifies that the user who sent the command has the designated commanderRole from the config file.
export const verifyUser = (id, guildId = config.mainServer) => {
    return client.guilds.fetch(guildId).then(guild => {
        return guild.members.fetch(id).then(member => {
            let matchesRoleName = member.roles.cache.find(r => r.name === config.allowedRoleName);
            debugLog(`VERIFICATION OF ${member.displayName} IN ${guild.name}`)
            debugLog(`Role name matches config: ${!!matchesRoleName}`);
            debugLog(`Role id matches config: ${member._roles.includes(config.allowedRoleId)}`);
            debugLog(`Is guild owner: ${guild.ownerId === member.id}`);

            return member._roles.includes(config.allowedRoleId) || (guild.ownerId === member.id) || !!matchesRoleName;
        }).catch(err => console.log(`VERIFYUSER_MEMBER-FETCH_${id} ERROR: ${err}`));
    }).catch(err => console.log(`VERIFYUSER_GUILD-FETCH_${guildId} ERROR: ${err}`));
}