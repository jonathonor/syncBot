/* 
    syncBot, a super simple bot that gives you the ability to add/remove a role of a 
    member in two servers at the same time.
*/

// Use cases:
// 1. User role is added in the main server manually, if the user exists in any synced servers, any role with the same name will be applied in the synced servers
// 2. User role is added via slash command in the main server, if the user exists in any synced servers, the bot will apply the role with the same name in each synced server
// 3. User role is removed in the main server manually, any role with the same name is removed from the user in all synced servers
// 4. User role is removed via slash command in the main server, any role with the same name is removed from the user in each synced server
// 5. User is added to a synced server, roles that match names of roles the user has in the main server are applied to the user in the synced servers
// 6. User is removed from the main server, role names that the user has in the main server are removed in synced servers
import { createRequire } from "module";
const require = createRequire(import.meta.url);
var config = require('./config.json')
import {
    Client, GatewayIntentBits
} from "discord.js";
const axios = require('axios')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
// This is to keep the action from firing twice when using the (/) command, since the guildMemberUpdate will see the role update and fire the add/remove again.
let triggeredByIntention = false;

client.on('ready', () => {
    //TODO: Add validation of the config file
  console.log(`syncbot ready!`);
});

client.on('interactionCreate', async interaction => {
    // 2 === APPLICATION_COMMAND
    if (interaction.type !== 2) return;

    if (interaction.commandName === 'add') {
        verifyUser(interaction.member.id).then(async verified => {
            if (verified) {
                let member = interaction.options.data.find(obj => obj.name === 'user').member;
                let role = interaction.options.data.find(obj => obj.name === 'role').value;
                triggeredByIntention = true;
                addRole(member, role, interaction);
            } else {
                respondToInteraction(interaction, `You dont have the necessary role to send that command ${interaction.user.username}`);
            }
        }); 
    }
    
    if (interaction.commandName === 'remove') {
        verifyUser(interaction.member.id).then(async verified => {
            if (verified) {
                let member = interaction.options.data.find(obj => obj.name === 'user').member;
                let role = interaction.options.data.find(obj => obj.name === 'role').value;
                triggeredByIntention = true;
                removeRole(member, role, interaction);
            } else {
                respondToInteraction(interaction, `You dont have the necessary role to send that command ${interaction.user.username}`);
            }
        });
    }
});

// Manual function registered to (/) slash command to add a role from a user across all synced servers
let addRole = async (member, roleId, interaction = null) => {
    const mainServer = await client.guilds.fetch(config.mainServer);
    const mainServerRoleToAdd = await mainServer.roles.fetch(roleId);
    member.roles.add(mainServerRoleToAdd).catch(err => respondToInteraction(interaction, 'There was an error adding the role in the main server, see console for error', err));
    
    for (const server of config.syncedServers) {
        const serverToSync = await client.guilds.fetch(server);
        const serverToSyncRoles = await serverToSync.roles.fetch();
        const syncedServerRoleToAdd = serverToSyncRoles.find(r => r.name === mainServerRoleToAdd.name);
        let memberToSync = serverToSync.members.cache.find(m => m.id === member.id);
        if (memberToSync && syncedServerRoleToAdd) {
            memberToSync.roles.add(syncedServerRoleToAdd).catch(err => respondToInteraction(interaction, `There was an error adding the role in a synced server named: ${serverToSync.name}, see console for error`, err));
            respondToInteraction(interaction, `Added ${mainServerRoleToAdd.name} to ${member.user.username} in ${serverToSync.name}`);
        } else if (!syncedServerRoleToAdd) {
            respondToInteraction(interaction, `Unable to add role ${mainServerRoleToAdd.name} to ${member.user.username} in ${serverToSync.name}, role does not exist.`);
        } else {
            serverToSync.members.fetch().then(updatedMembers => {
                let updatedMember = updatedMembers.find(m => m.id === member.id);
                if (updatedMember && syncedServerRoleToAdd) {
                    updatedMember.roles.add(syncedServerRoleToAdd).catch(err => respondToInteraction(interaction, 'There was an error adding the role in the secondary server after fetching all users, see console for error', err));
                    respondToInteraction(interaction, `Added ${mainServerRoleToAdd.name} to ${member.user.username} in ${serverToSync.name}`);
                } else {
                    respondToInteraction(interaction, `Unable to add role ${mainServerRoleToAdd.name} to ${member.user.username} in ${serverToSync.name}, member does not exist.`);
                }
            });
        }
    }
}

// Manual function registered to (/) slash command to remove a role from a user across all synced servers
let removeRole = async (member, roleId, interaction = null) => {
    const mainServer = await client.guilds.fetch(config.mainServer);
    const mainServerRoleToRemove = await mainServer.roles.fetch(roleId);
    member.roles.remove(mainServerRoleToRemove).catch(err => respondToInteraction(interaction, 'There was an error removing the role in the main server, see console for error', err));
    
    for (const server of config.syncedServers) {
        const serverToSync = await client.guilds.fetch(server);
        const serverToSyncRoles = await serverToSync.roles.fetch();
        const syncedServerRoleToRemove = serverToSyncRoles.find(r => r.name === mainServerRoleToRemove.name);
        let memberToSync = serverToSync.members.cache.find(m => m.id === member.id);

        if (memberToSync && syncedServerRoleToRemove) {
            let memberHasRole = memberToSync.roles.cache.find(a => a.name === syncedServerRoleToRemove.name);

            if (memberHasRole) {
                memberToSync.roles.remove(syncedServerRoleToRemove).then(() => {
                    respondToInteraction(interaction, `Removed ${mainServerRoleToRemove.name} from ${member.user.username} in ${serverToSync.name}`);
                }).catch(err => respondToInteraction(interaction, `There was an error removing the role in a synced server named: ${serverToSync.name}, see console for error`, err));
            } else {
                respondToInteraction(interaction, `${member.user.username} did not have role ${mainServerRoleToRemove.name} to remove.`);
            }

        } else if (!syncedServerRoleToRemove) {
            respondToInteraction(interaction, `Unable to remove role ${mainServerRoleToRemove.name} from ${member.user.username} in ${serverToSync.name}, role does not exist.`);
        } else {
            serverToSync.members.fetch().then(updatedMembers => {
                let updatedMember = updatedMembers.find(m => m.id === member.id);
                if (updatedMember && syncedServerRoleToRemove) {
                    updatedMember.roles.remove(syncedServerRoleToRemove).catch(err => respondToInteraction(interaction, 'There was an error removing the role in the secondary server after fetching all users, see console for error', err));
                    respondToInteraction(interaction, `Removed ${mainServerRoleToRemove.name} from ${member.user.username} in ${serverToSync.name}`);
                } else {
                    respondToInteraction(interaction, `Unable to remove role ${mainServerRoleToRemove.name} from ${member.user.username} in ${serverToSync.name}, member does not exist.`);
                }
            });
        }
    }
}

let throttleUpdate = () => {
    setTimeout(() => {
        triggeredByIntention = false;
    }, 2000);
}

// Verifies that the user who sent the command has the designated commanderRole from the config file.
let verifyUser = (id) => {
    return client.guilds.fetch(config.mainServer).then(guild => {
        return guild.members.fetch(id).then(member => {
            return member._roles.includes(config.allowedRoleId) || (guild.ownerId === member.id);
        });
    });
}

// Responds to each (/) slash command with outcome of the command, if this was triggered by a client event or an error, it logs the outcome to the log channel denoted in config
let respondToInteraction = async (interaction, message, error = null) => {
    if (!interaction) {
        const mainServer = await client.guilds.fetch(config.mainServer);
        const logChannel = await mainServer.channels.fetch(config.logChannelId);
        logChannel.send(message);
    } else {

        let url = `https://discord.com/api/v8/interactions/${interaction.id}/${interaction.token}/callback`

        let json = {
            "type": 4,
            "data": {
                "content": message
            }
        }
        
        axios.post(url, json);
    }

    if (error) {
        console.log(error);
    }

    throttleUpdate();
}

// When a users roles are updated in the main server, update them in all synced servers.
client.on('guildMemberUpdate', async update => {
    if (!triggeredByIntention && (update.guild.id === config.mainServer)) {
        let oldRoles = update._roles;
        let newMember = await update.guild.members.fetch(update.user.id);
        let newRoles = newMember._roles;
        let memberId = update.user.id;
        let member = await update.guild.members.fetch(memberId);

        if (oldRoles.length > newRoles.length) {
            let roleToRemoveId = oldRoles.filter(id => !newRoles.includes(id))[0];
            removeRole(member, roleToRemoveId);
        }

        if (oldRoles.length < newRoles.length) {
            let roleToAddId = newRoles.filter(id => !oldRoles.includes(id))[0];
            addRole(member, roleToAddId);
        }
    }
});

// When a new user joins a synced server, then look for that users roles in the main server and apply them in the synced server.
client.on('guildMemberAdd', async addedMember => {
    if (config.syncedServers.includes(addedMember.guild.id)) {
        const mainServer = await client.guilds.fetch(config.mainServer);
        let mainServerMember = await mainServer.members.fetch(addedMember.user.id);
        let mainServerMemberRoles = [...mainServerMember.roles.cache.values()].filter(r => r.name !== '@everyone');

        for (const server of config.syncedServers) {
            const guildToSync = await client.guilds.fetch(server);
            let memberToSync = await guildToSync.members.fetch(addedMember.user.id);
            
            if (mainServerMemberRoles.length > 0) {
                let guildToSyncRoles = await guildToSync.roles.fetch();
                const logChannel = await mainServer.channels.fetch(config.logChannelId);

                mainServerMemberRoles.forEach(role => {
                    let roleToAdd = guildToSyncRoles.find(r => r.name === role.name);
                    if (roleToAdd && roleToAdd.id && roleToAdd.name) {
                        memberToSync.roles.add(roleToAdd).catch(err => console.log(err));
                    } 
                });
                logChannel.send(`Syncing roles in server: ${guildToSync.name} for new member: ${memberToSync.user.username}`);
            } 
        }
    }
});

// When a user leaves the main server, then remove all of matching roles from all synced servers.
client.on('guildMemberRemove', async removedMember => {
    if (removedMember.guild.id === config.mainServer) {
        const mainServer = await client.guilds.fetch(config.mainServer);
        let mainServerMember = removedMember;
        let mainServerMemberRoles = mainServerMember._roles;
        let mainServerRoles = await mainServer.roles.fetch();
        const logChannel = await mainServer.channels.fetch(config.logChannelId);

        for (const server of config.syncedServers) {
            const guildToSync = await client.guilds.fetch(server);
            let memberToSync = await guildToSync.members.fetch(removedMember.user.id);
            if (mainServerMemberRoles.length > 0) {
                let syncedServerRoles = await guildToSync.roles.fetch();
                mainServerMemberRoles.forEach(roleId => {
                    let mainServerRole = mainServerRoles.find(r => r.id === roleId);
                    let roleToRemove = syncedServerRoles.find(r => r.name === mainServerRole.name);
                    if (roleToRemove) {
                        memberToSync.roles.remove(roleToRemove).catch(err => console.log(err));
                    } 
                });
                logChannel.send(`Removing roles from: ${memberToSync.user.username} in server: ${guildToSync.name} since they left the main server`);
            } 
        }   
    }
});

client.login(config.token);