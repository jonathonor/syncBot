import {
    Client, GatewayIntentBits
} from "discord.js";

// This is to keep the action from firing twice when using the (/) command, since the guildMemberUpdate will see the role update and fire the add/remove again.
export const globals = {
    triggeredByIntention: false,
    client: new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] })
}
export const isDebug = process.argv[2] === 'debug';
export const isTest = process.env.NODE_ENV === 'test';
