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
import { colorLog } from "./helpers.js";
const axios = require('axios')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
// This is to keep the action from firing twice when using the (/) command, since the guildMemberUpdate will see the role update and fire the add/remove again.
let triggeredByIntention = false;
const isDebug = process.argv[2] === 'debug';

let verifyConfig = () => {
    console.log("\x1b[91mError \x1b[93mWarning \x1b[94mInfo\x1b[0m")

    let hasError = false;
    colorLog('info', 'VERIFYING CONFIG FILE');

    //errors
    if (!config.applicationId) {
        hasError = true;
        colorLog('error', 'Config applicationId missing, please check.');
    }

    if (!config.token) {
        hasError = true;
        colorLog('error', 'Config token missing, please add it.');
    }

    if (!config.mainServer) {
        hasError = true;
        colorLog('error', 'Config mainserver missing, please check.');
    }

    if (!config.syncedServers || (config.syncedServers && !Array.isArray(config.syncedServers))) {
        hasError = true;
        colorLog('error', 'Config syncedServers missing or not Array, please verify it exists and matches structure "syncedServers": ["123456789123456789"], ');
    }

    // warnings
    if (!config.logChannelId) {
        colorLog('warning', 'logChannelId not found in config file, logs will not be sent.');
    }

    if (!config.allowedRoleName) {
        if (!config.allowedRoleId) {
            colorLog('warning', 'allowedRoleName and allowedRoleId not found in config file, only server owner can use commands.');
        }
        colorLog('warning', 'allowedRoleName not found in config file, only server owner can use commands or user with allowedRoleId.');
    }

    if (!config.allowedRoleId) {
        if (!config.allowedRoleName) {
            colorLog('warning', 'allowedRoleId and allowedRoleName not found in config file, only server owner can use commands.');
        }
        colorLog('warning', 'allowedRoleId not found in config file, only server owner can use commands or user with allowedRoleName.');
    }

    if (hasError) {
        colorLog('error', 'CONFIG FILE HAD ERROR, EXITING!');
        process.exit(1);
    } else {
        colorLog('info', 'FINISHED VERIFYING CONFIG FILE');
    }
}

verifyConfig();

client.on('ready', async () => {
    let hasError = false;
    console.log(`syncbot ready!`);
    console.log(`debug mode set to ${isDebug}`);

    colorLog('info', `VERIFYING BOT IS IN ALL SERVER ID's IN CONFIG FILE`);
    const guildsBotIsIn = await client.guilds.fetch();
    if (!guildsBotIsIn.findKey(guild => guild.id === config.mainServer)) {
        hasError = true;
        colorLog('error', `Bot is not in main server with id: ${config.mainServer} Please invite bot to server and restart bot.`);
    }
    
    for (const serverId of config.syncedServers) {
        if (!guildsBotIsIn.findKey(guild => guild.id === serverId)) {
            hasError = true;
            colorLog('error', `Bot is not in synced server ${serverId}: Please invite bot to server and restart bot.`);
        }
    }

    if (hasError) {
        colorLog('error', 'BOT NOT IN A SERVER, EXITING!');
        process.exit(1);
    } else {
        colorLog('info', 'FINISHED VERIFYING BOT IS IN ALL SERVERS FROM CONFIG FILE');
    }
});

client.on('interactionCreate', async interaction => {
    // 2 === APPLICATION_COMMAND
    if (interaction.type !== 2) return;
    if (!interaction.guildId) {
        respondToInteraction(interaction, 'This command must be sent from a guild/server.');
    }

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

    if (interaction.commandName === 'role-checker') {
        verifyUser(interaction.member.id).then(async verified => {

            if (verified && (interaction.guildId === config.mainServer)) {
                let option = interaction.options.data.find(obj => obj.name === 'option').value;
                triggeredByIntention = true;
                debugLog(`${interaction.member.displayName} is verified, running role checker with ${option}`);
                
                if (interaction.guild.memberCount > 100) {
                    await interaction.reply({content: `This may take a while since you have ${interaction.guild.memberCount}, I'll send you a DM when I'm done.`, ephemeral: true});
                } else {
                    await interaction.deferReply({ ephemeral: true });
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
        });
    }
});

let newAnalyze = async (interaction, forceSync) => {
    let data = { membersAnalyzed: 0, membersWithDifferences: [], errors: [] };
    let startTime = new Date();

    let mainServerMembers = await interaction.guild.members.fetch();
    let mainServerRoles = await interaction.guild.roles.fetch();
    let mainServerRoleNames = mainServerRoles.map(r => r.name);
    let mainServerPremiumRole = interaction.guild.roles.premiumSubscriberRole;

    const mainServerMe = await interaction.guild.members.fetchMe();
    const mainServerMeRole = mainServerMe.roles.botRole;
    const mainServerRolesHigherThanBot = mainServerRoles
        .filter(r => r.comparePositionTo(mainServerMeRole) > 0)
        .filter(r => r.id !== mainServerPremiumRole)
        .map(r => r.name);

    let hasDifferingRoles = false;
    for (const server of config.syncedServers) {
        let syncedServer = await client.guilds.fetch(server);
        let syncedServerMembers = await syncedServer.members.fetch();
        let syncedServerRoles = await syncedServer.roles.fetch();
        let syncedServerRoleNames = syncedServerRoles.map(r => r.name);
        let syncedServerPremiumRole = syncedServer.roles.premiumSubscriberRole;

        const syncedMe = await syncedServer.members.fetchMe();
        const syncedMeRole = syncedMe.roles.botRole;
        const syncedServerRolesHigherThanBot = syncedServerRoles
            .filter(r => r.comparePositionTo(syncedMeRole) > 0)
            .filter(r => r.id !== syncedServerPremiumRole)
            .map(r => r.name);

        for (const syncedMember of syncedServerMembers.values()) {
            if (syncedMember.manageable && !syncedMember.user.bot) {
                let memberObj = {username: interaction.member.displayName, serversWithDifferingRoles: []};

                let syncedMemberRoles = syncedMember.roles.cache;
                let syncedMemberRoleNames = syncedMemberRoles.map(r => r.name);
                let mainServerMember = mainServerMembers.get(syncedMember.id);
                
                if (mainServerMember) {
                    let mainServerMemberRoles = mainServerMember.roles.cache;
                    let mainServerMemberRoleNames = mainServerMemberRoles.map(r => r.name);

                    let roleCollectionToRemove = syncedMemberRoles
                                            .filter(r => mainServerRoleNames.includes(r.name) && !mainServerMemberRoleNames.includes(r.name))
                                            .filter(r => !mainServerRolesHigherThanBot.includes(r.name));

                    let roleCollectionToAdd = mainServerMemberRoles
                                            .filter(r => syncedServerRoleNames.includes(r.name) && !syncedMemberRoleNames.includes(r.name))
                                            .filter(r => !syncedServerRolesHigherThanBot.includes(r.name))
                                            .map(role => syncedServerRoles.find(r => r.name === role.name));
                    
                    let rolesToRemoveInThisServer = [...roleCollectionToRemove.values()];
                    let roleNamesToRemoveInThisServer = rolesToRemoveInThisServer.map(r => r.name);
                    debugLog(`Roles ${syncedMember.displayName} has in ${syncedServer.name} but not in mainserver: ${roleNamesToRemoveInThisServer}`);
    
                    let rolesToAddInThisServer = [...roleCollectionToAdd.values()];
                    let roleNamesToAddInThisServer = rolesToAddInThisServer.map(r => r.name);
                    debugLog(`Roles ${syncedMember.displayName} has in mainserver but not in ${syncedServer.name}: ${roleNamesToAddInThisServer}`);


                    if (rolesToRemoveInThisServer.length > 0 || rolesToAddInThisServer.length > 0) {
                        hasDifferingRoles = true;
                        let remove = forceSync ? 'rolesRemovedToMatchMainserver' : 'rolesToRemoveToMatchMainserver';
                        let add = forceSync ? 'rolesAddedToMatchMainserver' : 'rolesToAddToMatchMainServer';
                        if (rolesToRemoveInThisServer.length > 0 && rolesToAddInThisServer.length === 0) {
                            debugLog(`Roles to be removed: ${roleNamesToRemoveInThisServer} from ${syncedMember.displayName} in ${syncedServer.name}`)
                            if (forceSync) {
                                await syncedMember.roles.remove(rolesToRemoveInThisServer);
                            }
    
                            memberObj.serversWithDifferingRoles
                            .push({ serverName: syncedServer.name,
                                [`${remove}`]: roleNamesToRemoveInThisServer,
                            });
                        } 
                        if (rolesToAddInThisServer.length > 0 && rolesToRemoveInThisServer.length === 0) {
                            debugLog(`Roles to be added: ${roleNamesToAddInThisServer} to ${syncedMember.displayName} in ${syncedServer.name}`)
                            if (forceSync) {
                                await syncedMember.roles.add(rolesToAddInThisServer);
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
                                await syncedMember.roles.remove(rolesToRemoveInThisServer);
                                await syncedMember.roles.add(rolesToAddInThisServer);
                            }
        
                            memberObj.serversWithDifferingRoles
                            .push({ serverName: syncedServer.name,
                                [`${remove}`]: roleNamesToRemoveInThisServer,
                                [`${add}`]: roleNamesToAddInThisServer
                            });
                        }
                    }
                } else {
                    // await member.roles.set([]);
                    colorLog('error', `${syncedMember.displayName} does not exist in main server`);
                }
                debugLog(`${syncedServer.name} has differing roles from mainserver: ${hasDifferingRoles}`)
                if (hasDifferingRoles) {
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
        await interaction.editReply(`I finished processing ${data.membersAnalyzed} members in ${minutes} minutes and ${seconds} seconds. There were ${data.errors.length} errors.`);
    }
    triggeredByIntention = false;
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
    });
};

// Manual function registered to (/) slash command to add a role from a user across all synced servers
let addRole = async (member, roleId, interaction = null) => {
    const mainServer = await client.guilds.fetch(config.mainServer);
    const mainServerRoleToAdd = await mainServer.roles.fetch(roleId);

    if (!!interaction) {
        member.roles.add(mainServerRoleToAdd).catch(err => respondToInteraction(interaction, 'There was an error adding the role in the main server, see console for error', err));
    }
    
    for (const server of config.syncedServers) {
        // TODO: if bot is not in server, this will fail (user has syncedServer id that they didn't invite bot to)
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

    if (!!interaction) {
        member.roles.remove(mainServerRoleToRemove).catch(err => respondToInteraction(interaction, 'There was an error removing the role in the main server, see console for error', err));
    }
    
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
                respondToInteraction(interaction, `${member.user.username} did not have role: ${mainServerRoleToRemove.name} in ${serverToSync.name} to remove.`);
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

// When a users roles are updated in the main server, update them in all synced servers.
client.on('guildMemberUpdate', (oldMember, updatedMember) => {
    if (!triggeredByIntention && (updatedMember.guild.id === config.mainServer)) {
        const oldRoles = oldMember.roles.cache;
        const newRoles = updatedMember.roles.cache;

        let oldRolesIds = oldRoles.map(r => r.id);
        let newRolesIds = newRoles.map(r => r.id);

        if (oldRolesIds.length > newRolesIds.length) {
            let roleToRemove = oldRoles.filter(role => !newRolesIds.includes(role.id)).first();
            removeRole(updatedMember, roleToRemove.id);
        }

        if (oldRolesIds.length < newRolesIds.length) {
            let roleToAdd = newRoles.filter(role => !oldRolesIds.includes(role.id)).first();
            addRole(updatedMember, roleToAdd.id);
        }
    }
});

// When a new user joins a synced server, then look for that users roles in the main server and apply them in the synced server.
client.on('guildMemberAdd', async addedMember => {
    debugLog(`${addedMember.displayName} joined ${addedMember.guild.name}`);
    if (config.syncedServers.includes(addedMember.guild.id)) {
        debugLog(`Config lists ${addedMember.guild.name} as synced server.`);
        const mainServer = await client.guilds.fetch(config.mainServer);
        debugLog(`Fetched mainserver: ${mainServer.name}`);
        mainServer.members.fetch(addedMember.user.id).then(async mainServerMember => {
            debugLog(`Found member in mainserver: ${mainServerMember.displayName}`);
            let mainServerMemberRoles = mainServerMember.roles.cache;
            let mainServerMemberRolesFiltered = mainServerMemberRoles.filter(r => r.name !== '@everyone');
            debugLog(`Found ${mainServerMemberRolesFiltered.size} member roles for ${addedMember.displayName} in mainserver: ${mainServerMemberRolesFiltered.map(r => r.name)}`);
            const guildToSync = addedMember.guild;
            let memberToSync = addedMember;
            
            if (mainServerMemberRolesFiltered.size > 0) {
                debugLog(`Adding roles from mainserver: ${mainServerMemberRolesFiltered.map(r => r.name)} for ${addedMember.displayName} in ${addedMember.guild.name}`);

                let guildToSyncRoles = await guildToSync.roles.fetch();
                const logChannel = await mainServer.channels.fetch(config.logChannelId);
    
                mainServerMemberRolesFiltered.forEach(role => {
                    let roleToAdd = guildToSyncRoles.find(r => r.name === role.name);
                    if (roleToAdd && roleToAdd.id && roleToAdd.name) {
                        memberToSync.roles.add(roleToAdd).catch(err => console.log(err));
                    } 
                });
                logChannel.send(`Syncing roles in server: ${guildToSync.name} for new member: ${memberToSync.user.username}`);
            } 
        }).catch(e => {
            console.log(e);
            debugLog(`Not adding any roles for ${addedMember.displayName} because they aren't in the main server`);
        });
    }
});

// When a user leaves the main server, then remove all of matching roles from all synced servers.
client.on('guildMemberRemove', async removedMember => {
    if (removedMember.guild.id === config.mainServer) {
        debugLog(`${removedMember.displayName} left mainserver: ${removedMember.guild.name}`);

        const mainServer = await client.guilds.fetch(config.mainServer);
        let mainServerMember = removedMember;
        let mainServerMemberRoles = mainServerMember.roles.cache;
        let mainServerMemberRoleIds = mainServerMemberRoles.filter(r => r.name !== '@everyone').map(r => r.id);
        let mainServerRoles = await mainServer.roles.fetch();
        let mainServerRoleNames = mainServerMemberRoles.filter(r => r.name !== '@everyone').map(r => r.name);
        const logChannel = await mainServer.channels.fetch(config.logChannelId);

        for (const server of config.syncedServers) {
            const guildToSync = await client.guilds.fetch(server);
            debugLog(`Removing roles ${mainServerRoleNames} from ${removedMember.displayName} in: ${guildToSync.name}`);

            guildToSync.members.fetch(removedMember.user.id).then(async memberToSync => {
                debugLog(`Removing ${mainServerRoleNames} from ${removedMember.displayName} in ${guildToSync.name}`);
                if (mainServerMemberRoleIds.length > 0) {
                    let syncedServerRoles = await guildToSync.roles.fetch();
                    mainServerMemberRoleIds.forEach(roleId => {
                        let mainServerRole = mainServerRoles.find(r => r.id === roleId);
                        let roleToRemove = syncedServerRoles.find(r => r.name === mainServerRole.name);
                        if (roleToRemove) {
                            memberToSync.roles.remove(roleToRemove).catch(err => console.log(err));
                        } 
                    });
                    logChannel.send(`Removing roles from: ${memberToSync.user.username} in server: ${guildToSync.name} since they left the main server`);
                }
            }).catch(e => {
                debugLog(`Not removing roles from ${removedMember.displayName} in ${guildToSync.name} because they aren't in that server.`);
            });
        }   
    }
});

let debugLog = (str) => {
    if (isDebug) {
        console.log(str);
    }
}

let throttleUpdate = () => {
    setTimeout(() => {
        triggeredByIntention = false;
    }, 2000);
}

// Verifies that the user who sent the command has the designated commanderRole from the config file.
let verifyUser = (id, guildId = config.mainServer) => {
    return client.guilds.fetch(guildId).then(guild => {
        return guild.members.fetch(id).then(member => {
            let matchesRoleName = member.roles.cache.find(r => r.name === config.allowedRoleName);
            debugLog(`VERIFICATION OF ${member.displayName} IN ${guild.name}`)
            debugLog(`Role name matches config: ${!!matchesRoleName}`);
            debugLog(`Role id matches config: ${member._roles.includes(config.allowedRoleId)}`);
            debugLog(`Is guild owner: ${guild.ownerId === member.id}`);

            return member._roles.includes(config.allowedRoleId) || (guild.ownerId === member.id) || !!matchesRoleName;
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

client.login(config.token);