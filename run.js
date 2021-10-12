/* 
    syncBot, a super simple bot that gives you the ability to add/remove a role of a 
    member in two servers at the same time.
*/
var config = require('./config.json')
const { Client, Intents } = require('discord.js');
const axios = require('axios')
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

client.on('ready', () => {
  console.log(`syncbot ready!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'add') {
        if (verifyUser(interaction.member.id)) {
            let member = interaction.options.data.find(obj => obj.type === 'USER').member;
            let role = interaction.options.data.find(obj => obj.type === 'ROLE').value;
            addRole(member, role, interaction);
        }
    }

    if (interaction.commandName === 'remove') {
        if (verifyUser(interaction.member.id)) {
            let member = interaction.options.data.find(obj => obj.type === 'USER').member;
            let role = interaction.options.data.find(obj => obj.type === 'ROLE').value;
            removeRole(member, role, interaction);
        }
    }

});

addRole = async (member, roleId, interaction = null) => {
    const guild1 = await client.guilds.fetch(config.server1id);
    const roleToAdd1 = await guild1.roles.fetch(roleId);
    member.roles.add(roleToAdd1).catch(err => respondToInteraction(interaction, 'There was an error adding the role in the main server, see console for error', err));
    const guild2 = await client.guilds.fetch(config.server2id);
    const rolesToAdd2 = await guild2.roles.fetch();
    const roleToAdd2 = rolesToAdd2.find(r => r.name === roleToAdd1.name);
    let member2 = await guild2.members.fetch(member.id);
    if (member2 && roleToAdd2) {
        member2.roles.add(roleToAdd2).catch(err => respondToInteraction(interaction, 'There was an error adding the role in the secondary server, see console for error', err));
        respondToInteraction(interaction, `Applied ${roleToAdd1.name} to ${member.user.username} in ${guild2.name}`);
    } else if (!roleToAdd2) {
        respondToInteraction(interaction, `Unable to add role ${roleToAdd1.name} to ${member.user.username} in ${guild2.name}, role does not exist`);
    } else {
        guild2.members.fetch().then(guild2Updated => {
            let member2Updated = guild2Updated.members.fetch(member.id);
            if (member2Updated && roleToAdd2) {
                member2Updated.roles.add(roleToRemove2).catch(err => respondToInteraction(interaction, 'There was an error adding the role in the secondary server after fetching all users, see console for error', err));
                respondToInteraction(interaction, `Applied ${roleToRemove1.name} to ${member.user.username} in ${guild2.name}`);
            } else {
                respondToInteraction(interaction, `Unable to add role ${roleToAdd1.name} to ${member.user.username} in ${guild2.name}, member does not exist`);
            }
        });
    }
}

removeRole = async (member, roleId, interaction = null) => {
    const guild1 = await client.guilds.fetch(config.server1id);
    const roleToRemove1 = await guild1.roles.fetch(roleId);
    member.roles.remove(roleToRemove1).catch(err => respondToInteraction(interaction, 'There was an error removing the role in the main server, see console for error', err));
    const guild2 = await client.guilds.fetch(config.server2id);
    const rolesToRemove2 = await guild2.roles.fetch();
    const roleToRemove2 = rolesToRemove2.find(r => r.name === roleToRemove1.name);
    let member2 = await guild2.members.fetch(member.id);
    if (member2 && roleToRemove2) {
        member2.roles.remove(roleToRemove2).catch(err => respondToInteraction(interaction, 'There was an error removing the role in the secondary server, see console for error', err));
        respondToInteraction(interaction, `Removed ${roleToRemove1.name} from ${member.user.username} in ${guild2.name}`);
    } else if (!roleToRemove2) {
        respondToInteraction(interaction, `Unable to remove role ${roleToRemove1.name} from ${member.user.username} in ${guild2.name}, role does not exist.`);
    } else {
        guild2.members.fetch().then(guild2Updated => {
            let member2Updated = guild2Updated.members.fetch(member.id);
            if (member2Updated && roleToRemove2) {
                member2Updated.roles.remove(roleToRemove2).catch(err => respondToInteraction(interaction, 'There was an error removing the role in the secondary server after fetching all users, see console for error', err));
                respondToInteraction(interaction, `Removed ${roleToRemove1.name} from ${member.user.username} in ${guild2.name}`);
            } else {
                respondToInteraction(interaction, `Unable to remove role ${roleToRemove1.name} from ${member.user.username} in ${guild2.name}, member does not exist.`);
            }
        });
    }
}

verifyUser = (id) => {
    return client.guilds.fetch(config.server1id).then(guild => {
        return guild.members.fetch(id).then(member => {
            return member._roles.find(role => role.name === config.commanderRole);
        });
    });
}

respondToInteraction = async (interaction, message, error = null) => {
    if (!interaction) {
        const guild1 = await client.guilds.fetch(config.server1id);
        const logChannel = await guild1.channels.fetch(config.logChannelId);
        logChannel.send(message);
        return;
    }

    let url = `https://discord.com/api/v8/interactions/${interaction.id}/${interaction.token}/callback`

    let json = {
        "type": 4,
        "data": {
            "content": message
        }
    }
    
    axios.post(url, json);
    if (error) {
        console.log(error);
    }
}

// client.on('guildMemberUpdate', async update => {
//     if (update.guild.id === config.server1id) {
//         let oldRoles = update._roles;
//         let newRoles = await update.guild.members.fetch(update.user.id)._roles
//         let memberId = update.user.id;
//         let member = await update.guild.members.fetch(memberId);

//         if (oldRoles.length > newRoles.length) {
//             let roleToRemoveId = oldRoles.filter(id => !newRoles.includes(id))[0];
//             removeRole(member, roleToRemoveId);
//         }

//         if (oldRoles.length < newRoles.length) {
//             let roleToAddId = newRoles.filter(id => !oldRoles.includes(id))[0];
//             addRole(member, roleToAddId);
//         }
//     }
// });

// client.on('guildMemberAdd', addedMember => {
//     if (addedMember.guild.id === config.server2id) {
//         setTimeout( async () => {
//             const guild1 = await client.guilds.fetch(config.server1id);
//             const guild2 = await client.guilds.fetch(config.server2id);
//             let memberIn1 = await guild1.members.fetch(addedMember.user.id);
//             let memberIn2 = await guild2.members.fetch(addedMember.user.id);
//             let member1Roles = [...memberIn1.roles];
            
//             if (member1Roles.length > 0) {
//                 member1Roles.forEach(async role => {
//                     let guild2Roles = await guild2.roles.fetch();
//                     let apply = guild2Roles.find(r => r.name === role[1].name);
//                     if (apply && apply.id && apply.name) {
//                         memberIn2.roles.add(apply).catch(err => console.log(err));
//                     } 
//                 });
//                 const logChannel = await guild1.channels.fetch(config.logChannelId);
//                 logChannel.send('Checking and syncing roles in secondary server for new member: ' + memberIn2.user.username);
//             } 
//         }, 3000);
//     }
// });

// client.on('guildMemberRemove', removedMember => {
//     if (removedMember.guild.id === config.server1id) {
//         setTimeout( async () => {
//             const guild1 = await client.guilds.fetch(config.server1id);
//             const guild2 = await client.guilds.fetch(config.server2id);
//             let memberIn1 = removedMember;
//             let memberIn2 = await guild2.members.fetch(removedMember.user.id);
//             let member1Roles = memberIn1._roles;
//             if (member1Roles.length > 0) {
//                 member1Roles.forEach(async roleId => {
//                     let server1Role = await guild1.roles.fetch(roleId);
//                     let guild2Roles = await guild2.roles();
//                     let apply = guild2Roles.find(r => r.name === server1Role.name);
//                     if (apply) {
//                         memberIn2.roles.remove(apply).catch(err => console.log(err));
//                     } 
//                 });
//                 const logChannel = await guild1.channels.fetch(config.logChannelId);
//                 logChannel.send('Removing roles from user that left secondary server: ' + memberIn2.user.username);
//             } 
//         }, 3000);
//     }
// });

client.login(config.token);