import { globals } from "../globals.js";
import { verifyBotIsInAllServers } from "../verifiers.js";

export let onReadyHandler = async () => {
    await verifyBotIsInAllServers().catch(console.error);
    await initializeCache().catch(console.error);
}

const initializeCache = async () => {
    const guildsBotIsIn = await globals.client.guilds.fetch().catch(err => console.log(`ONREADY-FETCH_GUILDS: ${err}`));
    for (const guild of guildsBotIsIn.values()) {
        await guild.members.fetch().catch(err => `INIT_CACHE ERROR: ${err}`);
    }

    return;
}