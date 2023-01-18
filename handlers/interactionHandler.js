import { debugLog, respondToInteraction } from "../helpers.js";
import { addRole } from "../commands/addRole.js";
import { removeRole } from "../commands/removeRole.js";
import { client, globals } from "../globals.js";
import { verifyUser } from "../verifiers.js";
import config from "../config.js";

export const interactionHandler = async interaction => {
    if (interaction.type !== 2) return; // 2 === APPLICATION_COMMAND
    if (!interaction.guildId) {
        respondToInteraction(interaction, 'This command must be sent from a guild/server.');
        return;
    }

    verifyUser(interaction.member.id).then(async verified => {
        if (!verified) {
            respondToInteraction(interaction, `You dont have the necessary role to send that command ${interaction.user.username}`);
        } else {
            if (interaction.commandName === 'add') {
                const member = interaction.options.data.find(obj => obj.name === 'user').member;
                const role = interaction.options.data.find(obj => obj.name === 'role').value;
                globals.triggeredByIntention = true;
                addRole(member, role, interaction);
            }
        
            if (interaction.commandName === 'remove') {
                const member = interaction.options.data.find(obj => obj.name === 'user').member;
                const role = interaction.options.data.find(obj => obj.name === 'role').value;
                globals.triggeredByIntention = true;
                removeRole(member, role, interaction);
            }
    
            if (interaction.commandName === 'role-checker') {
                if (interaction.guildId === config.mainServer) {
                    let option = interaction.options.data.find(obj => obj.name === 'option').value;
                    globals.triggeredByIntention = true;
                    debugLog(`${interaction.member.displayName} is verified, running role checker with ${option}`);
                    
                    if (interaction.guild.memberCount > 100) {
                        await interaction.reply({content: `This may take a while since you have ${interaction.guild.memberCount}, I'll send you a DM when I'm done.`, ephemeral: true})
                        .catch(err => console.log(`ROLECHECKER_INTERACTION-REPLY ERROR: ${err}`));;
                    } else {
                        await interaction.deferReply({ ephemeral: true }).catch(err => console.log(`ROLECHECKER_INTERACTION-DEFER ERROR: ${err}`));
                    }
        
                    if (option === 'analyze')
                    {
                        await newAnalyze(interaction, false);
                    } else if (option === 'force') {
                        await newAnalyze(interaction, true);
                    }
                } else {
                    if (!verified) {
                        respondToInteraction(interaction, `You dont have the necessary role to send that command ${interaction.user.username}`);
                    } else {
                        respondToInteraction(interaction, `You need to run this command in your main server.`);
                    }
                }
            }
        }
    });
}

const newAnalyze = async (interaction, forceSync) => {
    let data = { membersAnalyzed: 0, membersWithDifferences: [], errors: [] };
    let startTime = new Date();

    let mainServerMembers = await interaction.guild.members.fetch().catch(err => console.log(`ANALYZE_GUILD-MEMBERS-FETCH ERROR: ${err}`));
    let mainServerRoles = await interaction.guild.roles.fetch().catch(err => console.log(`ANALYZE_GUILD-ROLES-FETCH ERROR: ${err}`));
    let mainServerRoleNames = mainServerRoles.map(r => r.name);
    let mainServerPremiumRole = interaction.guild.roles.premiumSubscriberRole; // for testing nitro{ id: 'mainPremium', name: 'serverBooster'} 

    const mainServerMe = await interaction.guild.members.fetchMe().catch(err => console.log(`ANALYZE_FETCH-MAINSERVER-ME: ${err}`));
    const mainServerMeRole = mainServerMe.roles.botRole;
    const mainServerRolesHigherThanBot = mainServerRoles
        .filter(r => r.comparePositionTo(mainServerMeRole) > 0)
        .map(r => r.name);

    debugLog(`Main server roles higher than bot: ${mainServerRolesHigherThanBot}`);
    debugLog(`Main server premium role ${mainServerPremiumRole}`);

    let hasDifferingRoles = false;
    for (const server of config.syncedServers) {
        let syncedServer = await client.guilds.fetch(server).catch(err => console.log(`ANALYZE_SYNCEDSERVER-${server}_FETCH ERROR: ${err}`));
        let syncedServerMembers = await syncedServer.members.fetch().catch(err => console.log(`ANALYZE_SYNCEDSERVER-${server}_FETCHMEMBERS ERROR: ${err}`));
        let syncedServerRoles = await syncedServer.roles.fetch().catch(err => console.log(`ANALYZE_SYNCEDSERVER-${server}_FETCHROLES ERROR: ${err}`));
        let syncedServerRoleNames = syncedServerRoles.map(r => r.name);
        let syncedServerPremiumRole = syncedServer.roles.premiumSubscriberRole; // for testing nitro{ id: 'syncedPremium', name: 'serverBooster'} 

        const syncedMe = await syncedServer.members.fetchMe().catch(err => console.log(`ANALYZE_FETCH-SYNCEDSERVER-ME-${server}: ${err}`));
        const syncedMeRole = syncedMe.roles.botRole;
        const syncedServerRolesHigherThanBot = syncedServerRoles
            .filter(r => r.comparePositionTo(syncedMeRole) > 0)
            .map(r => r.name);

        debugLog(`Synced server roles higher than bot: ${syncedServerRolesHigherThanBot}`);
        debugLog(`Synced server premium role: ${syncedServerPremiumRole}`);

        for (const syncedMember of syncedServerMembers.values()) {
            if (syncedMember.manageable && !syncedMember.user.bot) {
                let memberObj = {username: syncedMember.displayName, serversWithDifferingRoles: []};

                let syncedMemberRoles = syncedMember.roles.cache;
                let syncedMemberRoleNames = syncedMemberRoles.map(r => r.name);
                let mainServerMember = mainServerMembers.get(syncedMember.id);
                
                if (mainServerMember) {
                    let mainServerMemberRoles = mainServerMember.roles.cache;
                    let mainServerMemberRoleNames = mainServerMemberRoles.map(r => r.name);

                    let roleCollectionToRemove = syncedMemberRoles
                                            .filter(r => mainServerRoleNames.includes(r.name) && !mainServerMemberRoleNames.includes(r.name))
                                            .filter(r => !mainServerRolesHigherThanBot.includes(r.name))
                                            .filter(r => !syncedServerPremiumRole ||  (syncedServerPremiumRole && (r.name !== syncedServerPremiumRole.name)));

                    let roleCollectionToAdd = mainServerMemberRoles
                                            .filter(r => syncedServerRoleNames.includes(r.name) && !syncedMemberRoleNames.includes(r.name))
                                            .filter(r => !syncedServerRolesHigherThanBot.includes(r.name))
                                            .filter(r => !mainServerPremiumRole  || (mainServerPremiumRole && (r.name !== mainServerPremiumRole.name)))
                                            .map(role => syncedServerRoles.find(r => r.name === role.name));
                    
                    let rolesToRemoveInThisServer = [...roleCollectionToRemove.values()];
                    let roleNamesToRemoveInThisServer = rolesToRemoveInThisServer.map(r => r.name);
                    debugLog(`Roles ${syncedMember.displayName} has in ${syncedServer.name}: ${syncedMemberRoleNames}`);
                    debugLog(`Roles ${syncedMember.displayName} has in ${syncedServer.name} but not in mainserver: ${roleNamesToRemoveInThisServer}`);
    
                    let rolesToAddInThisServer = [...roleCollectionToAdd.values()];
                    let roleNamesToAddInThisServer = rolesToAddInThisServer.map(r => r.name);
                    debugLog(`Roles ${syncedMember.displayName} has in mainserver: ${mainServerMemberRoleNames}`);
                    debugLog(`Roles ${syncedMember.displayName} has in mainserver but not in ${syncedServer.name}: ${roleNamesToAddInThisServer}`);


                    if (rolesToRemoveInThisServer.length > 0 || rolesToAddInThisServer.length > 0) {
                        hasDifferingRoles = true;
                        let remove = forceSync ? 'rolesRemovedToMatchMainserver' : 'rolesToRemoveToMatchMainserver';
                        let add = forceSync ? 'rolesAddedToMatchMainserver' : 'rolesToAddToMatchMainServer';
                        if (rolesToRemoveInThisServer.length > 0 && rolesToAddInThisServer.length === 0) {
                            debugLog(`Roles to be removed: ${roleNamesToRemoveInThisServer} from ${syncedMember.displayName} in ${syncedServer.name}`)
                            if (forceSync) {
                                await syncedMember.roles.remove(rolesToRemoveInThisServer).catch(err => console.log(`ANALYZE_REMOVEROLE: ${err}`));
                            }
    
                            memberObj.serversWithDifferingRoles
                            .push({ serverName: syncedServer.name,
                                [`${remove}`]: roleNamesToRemoveInThisServer,
                            });
                        } 
                        if (rolesToAddInThisServer.length > 0 && rolesToRemoveInThisServer.length === 0) {
                            debugLog(`Roles to be added: ${roleNamesToAddInThisServer} to ${syncedMember.displayName} in ${syncedServer.name}`)
                            if (forceSync) {
                                await syncedMember.roles.add(rolesToAddInThisServer).catch(err => console.log(`ANALYZE_ADDROLE: ${err}`));
                            }
    
                            memberObj.serversWithDifferingRoles
                            .push({ serverName: syncedServer.name,
                                [`${add}`]: roleNamesToAddInThisServer,
                            });
                        } 
                        if (rolesToAddInThisServer.length > 0 && rolesToRemoveInThisServer.length > 0) {
                            debugLog(`Roles to be added and removed for ${syncedMember.displayName} in ${syncedServer.name}`)
                            debugLog(`Add: ${roleNamesToAddInThisServer}`)
                            debugLog(`Remove: ${roleNamesToRemoveInThisServer}`)
                            if (forceSync) {
                                debugLog(`Force syncing combination for: ${syncedMember.displayName}`)
                                await syncedMember.roles.remove(rolesToRemoveInThisServer).catch(err => console.log(`ANALYZE_BOTH_REMOVEROLE: ${err}`));
                                await syncedMember.roles.add(rolesToAddInThisServer).catch(err => console.log(`ANALYZE_BOTH_ADDROLE: ${err}`));
                            }
        
                            memberObj.serversWithDifferingRoles
                            .push({ serverName: syncedServer.name,
                                [`${remove}`]: roleNamesToRemoveInThisServer,
                                [`${add}`]: roleNamesToAddInThisServer
                            });
                        }
                    }
                } else {
                    // await member.roles.set([]); if we wanted to remove all roles from user here
                    debugLog(`${syncedMember.displayName} does not exist in main server`);
                }
                if (hasDifferingRoles) {
                    debugLog(`${syncedMember.displayName} in ${syncedServer.name} has differing roles from mainserver`)
                    data.membersWithDifferences.push(memberObj);
                }
            } else {
                data.errors.push(`${syncedMember.displayName} is not manageable or is a bot.`);
                debugLog(`${syncedMember.displayName} is not manageable or is a bot.`)
            }
            data.membersAnalyzed++;
        }
    }
    var delta = Math.abs(new Date().getTime() - startTime.getTime()) / 1000;
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;
    var seconds = delta % 60;

    if (interaction.isRepliable()) {
        await interaction.editReply(`I finished processing ${data.membersAnalyzed} members in ${minutes} minutes and ${seconds} seconds. There were ${data.errors.length} errors.`)
        .catch(err => console.log(`ANALYZE_INTERACTION-EDIT: ${err}`));
    }
    globals.triggeredByIntention = false;
    return interaction.user
        .createDM()
        .then((dmChannel) => {
        var buf = Buffer.from(JSON.stringify(data, null, 4));
        dmChannel.send({
            files: [
            {
                attachment: buf,
                name: `${interaction.guild.name}.json`,
            },
            ],
        });
    }).catch(err => console.log(`ANALYZE_CREATEDM ERROR: ${err}`));
};