import { respondToInteraction } from "../helpers.js";
import config from "../config.js";

// Manual function registered to (/) slash command to add a role from a user across all synced servers
export let addRole = async (member, roleId, interaction = null) => {
    const mainServer = await member.client.guilds.fetch(config.mainServer).catch(err => console.log(`ADDROLE_MAINSERVER-FETCH_${roleId}_${member.displayName} ERROR: ${err}`));
    const mainServerRoleToAdd = await mainServer.roles.fetch(roleId).catch(err => console.log(`ADDROLE_MAINSERVER-ROLE-FETCH_${roleId}_${member.displayName} ERROR: ${err}`));

    if (!!interaction) {
        await member.roles.add(mainServerRoleToAdd)
        .catch(err => respondToInteraction(interaction, 'There was an error adding the role in the main server, see console for error', err));
    }
    
    for (const server of config.syncedServers) {
        const serverToSync = await member.client.guilds.fetch(server).catch(err => console.log(`ADDROLE_SYNCEDSERVER-FETCH_${server}_${roleId}_${member.displayName} ERROR: ${err}`));
        const serverToSyncRoles = await serverToSync.roles.fetch().catch(err => console.log(`ADDROLE_SYNCEDSERVER-ROLES-FETCH_${roleId}_${member.displayName} ERROR: ${err}`));
        const syncedServerRoleToAdd = serverToSyncRoles.find(r => r.name === mainServerRoleToAdd.name);
        let memberToSync = await serverToSync.members.fetch(member.id).catch(err => console.log(`ADDROLE_SYNCEDSERVER:${server}-MEMBER_${member.displayName}_${roleId} ERROR: ${err}`));
        if (memberToSync && syncedServerRoleToAdd) {
            await memberToSync.roles.add(syncedServerRoleToAdd).catch(err => respondToInteraction(interaction, `There was an error adding the role in a synced server named: ${serverToSync.name}, see console for error`, err));
            respondToInteraction(interaction, `Added ${mainServerRoleToAdd.name} to ${member.user.username} in ${serverToSync.name}`);
        } else if (!syncedServerRoleToAdd) {
            respondToInteraction(interaction, `Unable to add role ${mainServerRoleToAdd.name} to ${member.user.username} in ${serverToSync.name}, role does not exist.`);
        } else {
            respondToInteraction(interaction, `Unable to add role ${mainServerRoleToAdd.name} to ${member.user.username} in ${serverToSync.name}, member does not exist.`);
        }
    }
} 