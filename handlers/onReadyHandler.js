import { colorLog } from "../helpers.js";
import { client, isDebug } from "../globals.js";
import config from "../config.js";

export let onReadyHandler = async () => {
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
}