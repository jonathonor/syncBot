/* 
    syncBot, a super simple bot that gives you the ability to add/remove a role of a 
    member in multiple servers at the same time.
*/

// Use cases:
// 1. User role is added in the main server manually, if the user exists in any synced servers, any role with the same name will be applied in the synced servers
// 2. User role is added via slash command in the main server, if the user exists in any synced servers, the bot will apply the role with the same name in each synced server
// 3. User role is removed in the main server manually, any role with the same name is removed from the user in all synced servers
// 4. User role is removed via slash command in the main server, any role with the same name is removed from the user in each synced server
// 5. User is added to a synced server, roles that match names of roles the user has in the main server are applied to the user in the synced servers
// 6. User is removed from the main server, role names that the user has in the main server are removed in synced servers
var config = require('./config.json')
import {
    Client, GatewayIntentBits
} from "discord.js";
import { colorLog } from "./helpers.js";
import { interactionHandler } from "./handlers/interactionHandler.js";
import { memberAddHandler } from "./handlers/memberAddHandler";
import { memberRemoveHandler } from "./handlers/memberRemoveHandler";
import { memberUpdateHandler } from "./handlers/memberUpdateHandler";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// This is to keep the action from firing twice when using the (/) command, since the guildMemberUpdate will see the role update and fire the add/remove again.
global.triggeredByIntention = false;
const isDebug = process.argv[2] === 'debug';

let verifyConfig = () => {
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

verifyConfig();

client.on('ready', async () => {
    let hasError = false;
    console.log(`syncbot ready!`);
    console.log(`debug mode set to ${isDebug}`);

    colorLog('info', `VERIFYING BOT IS IN ALL SERVER ID's IN CONFIG FILE`);
    const guildsBotIsIn = await client.guilds.fetch().catch(err => console.log(`ONREADY-FETCH_GUILDS: ${err}`));
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

    if (config.logChannelId) {
        const mainServer = await client.guilds.fetch(config.mainServer).catch(err => console.log(`ONREADY-FETCH_MAINSERVER: ${err}`));
        const logChannel = await mainServer.channels.fetch(config.logChannelId).catch(err => console.log(`ONREADY-FETCH_LOGCHANNEL: ${err}`));
        
        await logChannel.send("Testing bot has access to logchannel.")
        .catch(err => {
            colorLog('error', 'BOT DOES NOT HAVE ACCESS TO LOGCHANNEL, EXITING!');
            console.log(`ONREADY-SENDING_TO_LOGCHANNEL ERROR: ${err}`);
            process.exit(1);
        });
    }

    if (hasError) {
        colorLog('error', 'BOT NOT IN A SERVER LISTED IN CONFIG, EXITING!');
        process.exit(1);
    } else {
        colorLog('info', 'FINISHED VERIFYING BOT IS IN ALL SERVERS FROM CONFIG FILE');
    }
});

client.on('interactionCreate', interactionHandler);

// When a users roles are updated in the main server, update them in all synced servers.
client.on('guildMemberUpdate', memberUpdateHandler);

// When a new user joins a synced server, then look for that users roles in the main server and apply them in the synced server.
client.on('guildMemberAdd', memberAddHandler);

// When a user leaves the main server, then remove all of matching roles from all synced servers.
client.on('guildMemberRemove', memberRemoveHandler);

client.login(config.token);