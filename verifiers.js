import { colorLog, debugLog } from "./helpers.js";
import config from "./config.js";
import { globals, isDebug } from "./globals.js";

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

// Verifies that the user who sent the command has the designated role from the config file.
export const verifyUser = async (id, guildId = config.mainServer) => {
    return globals.client.guilds.fetch(guildId).then(guild => {
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

export const verifyBotIsInAllServers = async () => {
    let hasError = false;
    console.log(`syncbot ready!`);
    console.log(`debug mode set to ${isDebug}`);

    colorLog('info', `VERIFYING BOT IS IN ALL SERVER ID's IN CONFIG FILE`);
    const guildsBotIsIn = await globals.client.guilds.fetch().catch(err => console.log(`ONREADY-FETCH_GUILDS: ${err}`));
    if (!guildsBotIsIn.findKey(guild => guild.id === config.mainServer)) {
        hasError = true;
        colorLog('error', `Bot is not in main server with id: ${config.mainServer} Please invite bot to server and restart bot.`);
    } 
    
    for (const serverId of config.syncedServers) {
        if (!guildsBotIsIn.findKey(guild => guild.id === serverId)) {
            hasError = true;
            colorLog('error', `Bot is not in synced server ${serverId}: Please invite bot to server and restart bot.`);
        }
    }

    if (hasError) {
        colorLog('error', 'BOT NOT IN A SERVER LISTED IN CONFIG, EXITING!');
        process.exit(1);
    } else {
        colorLog('info', 'FINISHED VERIFYING BOT IS IN ALL SERVERS FROM CONFIG FILE');
    }

    if (config.logChannelId) {
        const mainServer = await globals.client.guilds.fetch(config.mainServer).catch(err => console.log(`ONREADY-FETCH_MAINSERVER: ${err}`));
        const logChannel = await mainServer.channels.fetch(config.logChannelId).catch(err => console.log(`ONREADY-FETCH_LOGCHANNEL: ${err}`));
        
        return await logChannel.send("Testing bot has access to logchannel.")
        .catch(err => {
            colorLog('error', 'BOT DOES NOT HAVE ACCESS TO LOGCHANNEL, EXITING!');
            console.log(`ONREADY-SENDING_TO_LOGCHANNEL ERROR: ${err}`);
            process.exit(1);
        });
    }

    return;
}