import { debugLog } from "../helpers.js";

// When user joins a synced server, all roles from the mainserver should be added to them.
export const memberAddHandler = async addedMember => {
    debugLog(`${addedMember.displayName} joined ${addedMember.guild.name}`);
    if (config.syncedServers.includes(addedMember.guild.id)) {
        debugLog(`Config lists ${addedMember.guild.name} as synced server.`);
        const mainServer = await client.guilds.fetch(config.mainServer).catch(err => `MEMBERJOINED-MAINSERVER-FETCH ERROR: ${err}`);
        debugLog(`Fetched mainserver: ${mainServer.name}`);
        const mainServerMember = await mainServer.members.fetch(addedMember.user.id).catch(e => console.log(`MEMBERJOINED-NOT-IN-MAINSERVER ERROR: ${e}`));
        if (mainServerMember) {
            debugLog(`Found member in mainserver: ${mainServerMember.displayName}`);
            let mainServerMemberRoles = await mainServerMember.roles.fetch().catch(err => console.log(`MEMBERJOINED-MAINSERVER-ROLES ERROR:${err}`));
            let mainServerMemberRolesFiltered = mainServerMemberRoles.filter(r => r.name !== '@everyone');
            
            debugLog(`Found ${mainServerMemberRolesFiltered.size} member roles for ${addedMember.displayName} in mainserver: ${mainServerMemberRolesFiltered.map(r => r.name)}`);
            const guildToSync = addedMember.guild;
            let memberToSync = addedMember;
            
            if (mainServerMemberRolesFiltered.size > 0) {
                debugLog(`Adding roles from mainserver: ${mainServerMemberRolesFiltered.map(r => r.name)} for ${addedMember.displayName} in ${addedMember.guild.name}`);

                let guildToSyncRoles = await guildToSync.roles.fetch().catch(err => console.log(`MEMBERJOINED-ROLES-FETCH ERROR: ${err}`));
                const logChannel = await mainServer.channels.fetch(config.logChannelId).catch(err => console.log(`MEMBERJOINED-LOGCHANNEL-FETCH ERROR: ${err}`));

                for (role in mainServerMemberRolesFiltered) {
                    let roleToAdd = guildToSyncRoles.find(r => r.name === role.name);
                    if (roleToAdd) {
                        await memberToSync.roles.add(roleToAdd).catch(err => console.log(`MEMBERJOINED-ADDING-ROLE_${memberToSync.displayName}_${roleToAdd.name} ERROR: ${err}`));
                    }
                }
                await logChannel.send(`Syncing roles in server: ${guildToSync.name} for new member: ${memberToSync.user.username}`).catch(err => console.log(`MEMBERJOINED-LOGCHANNEL-SEND ERROR: ${err}`));
            } 
        } else {
            await logChannel.send(`Member does not exist in mainserver: ${memberToSync.user.username}`).catch(err => console.log(`MEMBERJOINED-NOMEMBER-LOGCHANNEL-SEND ERROR: ${err}`));
        }
    }
}