import { client } from "../globals.js";
import { verifyBotIsInAllServers } from "../verifiers.js";

export let onReadyHandler = async () => {
    await verifyBotIsInAllServers();
    await initializeCache();
}

const initializeCache = async () => {
    const guildsBotIsIn = await client.guilds.fetch().catch(err => console.log(`ONREADY-FETCH_GUILDS: ${err}`));

    for (guild in guildsBotIsIn) {
        await guild.members.fetch().catch(err => `INIT_CACHE ERROR: ${err}`);
    }

    return;
}