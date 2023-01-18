import { debugLog } from "../helpers.js";

// When a member leaves the main server, all roles they had there should be removed from synced servers
export const memberRemoveHandler = async removedMember => {
    if (removedMember.guild.id === config.mainServer) {
        debugLog(`${removedMember.displayName} left mainserver: ${removedMember.guild.name}`);

        const mainServer = removedMember.guild;
        let mainServerMember = removedMember;
        let mainServerMemberRoles = await mainServerMember.roles.fetch().catch(err => `MEMBERLEFT-MAINSERVERMEMBER-ROLES-FETCH ERROR: ${err}`);
        let mainServerRoleNames = mainServerMemberRoles.filter(r => r.name !== '@everyone').map(r => r.name);
        const logChannel = await mainServer.channels.fetch(config.logChannelId).catch(err => `MEMBERLEFT-MAINSERVER-LOGHANNEL-FETCH ERROR: ${err}`);

        for (const server of config.syncedServers) {
            const guildToSync = await client.guilds.fetch(server).catch(err => `MEMBERLEFT-SYNCEDSERVER-FETCH_${server} ERROR: ${err}`);
            const memberToSync = await guildToSync.members.fetch(removedMember.user.id).catch(e => console.log(`MEMBERLEFT-NOT-IN-MAINSERVER ERROR: ${e}`));
            if (memberToSync) {
                debugLog(`Removing roles ${mainServerRoleNames} from ${removedMember.displayName} in: ${guildToSync.name}`);
                if (mainServerRoleNames.length > 0) {
                    let syncedServerRoles = await guildToSync.roles.fetch().catch(err => `MEMBERLEFT-SYNCEDSERVER-ROLES-FETCH_${server} ERROR: ${err}`);
                    
                    for (roleName in mainServerRoleNames) {
                        let roleToRemove = syncedServerRoles.find(r => r.name === roleName);
                        if (roleToRemove) {
                            await memberToSync.roles.remove(roleToRemove).catch(err => console.log(`MEMBER_LEFT-REMOVING_ROLE_${memberToSync.displayName}_${roleToRemove.name} ERROR: ${err}`));
                        } 
                    }

                    await logChannel.send(`Removing roles from: ${memberToSync.user.username} in server: ${guildToSync.name} since they left the main server`).catch(err => console.log(`MEMBERLEFT-LOGCHANNEL-SEND ERROR: ${err}`));
                }
            } else {
                debugLog(`Not removing roles from ${removedMember.displayName} in ${guildToSync.name} because they aren't in that server.`);
            }
        }   
    }
}