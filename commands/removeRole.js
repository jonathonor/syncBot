import { respondToInteraction } from "../helpers.js";
import config from "../config.js";

// Manual function registered to (/) slash command to remove a role from a user across all synced servers
export let removeRole = async (member, roleId, interaction = null) => {
    const mainServer = await member.client.guilds.fetch(config.mainServer).catch(err => console.log(`REMOVEROLE_MAINSERVER-FETCH_${roleId}_${member.displayName} ERROR: ${err}`));
    const mainServerRoleToRemove = await mainServer.roles.fetch(roleId).catch(err => console.log(`REMOVEROLE_MAINSERVER-ROLE-FETCH_${roleId}_${member.displayName} ERROR: ${err}`));

    if (!!interaction) {
        await member.roles.remove(mainServerRoleToRemove)
        .catch(err => respondToInteraction(interaction, 'There was an error removing the role in the main server, see console for error', err));
    }
    
    for (const server of config.syncedServers) {
        const serverToSync = await member.client.guilds.fetch(server).catch(err => console.log(`REMOVEROLE_SYNCEDSERVER-FETCH_${server}_${roleId}_${member.displayName} ERROR: ${err}`));
        const serverToSyncRoles = await serverToSync.roles.fetch().catch(err => console.log(`REMOVEROLE_SYNCEDSERVER-ROLES-FETCH_${roleId}_${member.displayName} ERROR: ${err}`));
        const syncedServerRoleToRemove = serverToSyncRoles.find(r => r.name === mainServerRoleToRemove.name);
        let memberToSync = await serverToSync.members.fetch(member.id).catch(err => console.log(`REMOVEROLE_SYNCEDSERVER:${server}-MEMBER_${member.displayName}_${roleId} ERROR: ${err}`));

        if (memberToSync && syncedServerRoleToRemove) {
            let memberHasRole = memberToSync.roles.cache.find(a => a.name === syncedServerRoleToRemove.name);

            if (memberHasRole) {
                await memberToSync.roles.remove(syncedServerRoleToRemove).catch(err => respondToInteraction(interaction, `There was an error removing the role in a synced server named: ${serverToSync.name}, see console for error`, err));
                respondToInteraction(interaction, `Removed ${mainServerRoleToRemove.name} from ${member.user.username} in ${serverToSync.name}`);
            } else {
                respondToInteraction(interaction, `${member.user.username} did not have role: ${mainServerRoleToRemove.name} in ${serverToSync.name} to remove.`);
            }
        } else if (!syncedServerRoleToRemove) {
            respondToInteraction(interaction, `Unable to remove role ${mainServerRoleToRemove.name} from ${member.user.username} in ${serverToSync.name}, role does not exist.`);
        } else {
            respondToInteraction(interaction, `Unable to remove role ${mainServerRoleToRemove.name} from ${member.user.username} in ${serverToSync.name}, member does not exist.`);
        }
    }
}