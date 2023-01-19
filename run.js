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
import config from "./config.js";

import { onReadyHandler } from "./handlers/onReadyHandler.js";
import { interactionHandler } from "./handlers/interactionHandler.js";
import { memberAddHandler } from "./handlers/memberAddHandler.js";
import { memberRemoveHandler } from "./handlers/memberRemoveHandler.js";
import { memberUpdateHandler } from "./handlers/memberUpdateHandler.js";

import { verifyConfig } from "./verifiers.js";
import { globals } from "./globals.js";

verifyConfig();

globals.client.on('ready', onReadyHandler);

globals.client.on('interactionCreate', interactionHandler);

// When a new user joins a synced server, then look for that users roles in the main server and apply them in the synced server.
globals.client.on('guildMemberAdd', memberAddHandler);

// When a user leaves the main server, then remove all of matching roles from all synced servers.
globals.client.on('guildMemberRemove', memberRemoveHandler);

// When a users roles are updated in the main server, update them in all synced servers.
globals.client.on('guildMemberUpdate', memberUpdateHandler);

globals.client.login(config.token);