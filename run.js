/* 
    syncBot, a super simple bot that gives you the ability to add/remove a role of a 
    member in two servers at the same time.
*/
const Discord = require('discord.js');
const client = new Discord.Client();
var config = require('./config.json')

client.on('ready', () => {
  console.log('syncBot started.');
});

client.on('message', msg => {
    if (msg.content.startsWith('!add')) {
        if (verifyUser(msg.author.id)) {
            let member = msg.mentions.members.first();
            let role = msg.mentions.roles.first().id;
            addRole(member, role);
        }
    }
    if (msg.content.startsWith('!remove')) {
        if (verifyUser(msg.author.id)) {
            let member = msg.mentions.members.first();
            let role = msg.mentions.roles.first().id;
            removeRole(member, role);
        }
    }
});

client.on('guildMemberUpdate', update => {
    if (update.guild.id === config.server1id) {
        let oldRoles = update._roles
        let newRoles = update.guild.members.find(member => member.id === update.user.id)._roles
        let memberId = update.user.id;
        let member = update.guild.members.find(member => member.id === memberId)

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

client.on('guildMemberAdd', addedMember => {
    if (addedMember.guild.id === config.server2id) {
        setTimeout(() => {
            const guild1 = client.guilds.find(guild => guild.id === config.server1id);
            const guild2 = client.guilds.find(guild => guild.id === config.server2id);
            let memberIn1 = guild1.members.find(mem => mem.id === addedMember.user.id);
            let memberIn2 = guild2.members.find(mem => mem.id === addedMember.user.id);
            let member1Roles = [...memberIn1.roles];
            
            if (member1Roles.length > 0) {
                member1Roles.forEach(role => {
                    let apply = guild2.roles.find(r => r.name === role[1].name);
                    if (apply && apply.id && apply.name) {
                        memberIn2.addRole(apply).catch(err => console.log(err));
                    } 
                });
                const logChannel = guild1.channels.find(channel => channel.id === config.logChannelId);
                logChannel.send('Checking and syncing roles for new member '+ memberIn2.user.username + ' in server2 ');
            } 
        }, 3000);
    }
});

client.on('guildMemberRemove', removedMember => {
    if (removedMember.guild.id === config.server1id) {
        setTimeout(() => {
            const guild1 = client.guilds.find(guild => guild.id === config.server1id);
            const guild2 = client.guilds.find(guild => guild.id === config.server2id);
            let memberIn1 = removedMember;
            let memberIn2 = guild2.members.find(mem => mem.id === removedMember.user.id);
            let member1Roles = memberIn1._roles;
            if (member1Roles.length > 0) {
                member1Roles.forEach(roleId => {
                    let server1Role = guild1.roles.find(ro => ro.id === roleId)
                    let apply = guild2.roles.find(r => r.name === server1Role.name);
                    if (apply) {
                        memberIn2.removeRole(apply).catch(err => console.log(err));
                    } 
                });
                const logChannel = guild1.channels.find(channel => channel.id === config.logChannelId);
                logChannel.send('Removing roles from user that left: '+ memberIn2.user.username + ' in server2 ');
            } 
        }, 3000);
    }
});

addRole = (member, roleId) => {
    const guild1 = client.guilds.find(guild => guild.id === config.server1id);
    const logChannel = guild1.channels.find(channel => channel.id === config.logChannelId);
    const roleToAdd1 = guild1.roles.find(r => r.id === roleId);
    member.addRole(roleToAdd1).catch(err => console.log('err ' + err));
    const guild2 = client.guilds.find(guild => guild.id === config.server2id);
    const roleToAdd2 = guild2.roles[roleId] !== null ? guild2.roles.find(r => r.name === roleToAdd1.name) : null;
    let member2 = guild2.members.find(mem => mem.id === member.id);
    if (member2 && roleToAdd2) {
        member2.addRole(roleToAdd2).catch(err => console.log('err ' + err));
        logChannel.send('Applied ' + roleToAdd1.name + ' to ' + member.user.username + ' in ' + guild2.name);
    } else if (!roleToAdd2) {
        logChannel.send('Unable to add role ' + roleToAdd1.name + ' to ' + member.user.username + ' in ' + guild2.name + ', role does not exist.');
    } else {
        guild2.fetchMembers().then(guild2Updated => {
            let member2Updated = guild2Updated.members.find(mem => mem.id === member.id);
            if (member2Updated && roleToAdd2) {
                member2Updated.addRole(roleToAdd2).catch(err => console.log('err ' + err));
                logChannel.send('Applied ' + roleToAdd1.name + ' to ' + member.user.username + ' in ' + guild2.name);
            } else {
                logChannel.send('Unable to add role ' + roleToAdd1.name + ' to ' + member.user.username + ' in ' + guild2.name + ', member does not exist.');
            }
        });
    }
}

removeRole = (member, roleId) => {
    const guild1 = client.guilds.find(guild => guild.id === config.server1id);
    const logChannel = guild1.channels.find(channel => channel.id === config.logChannelId);
    const roleToRemove1 = guild1.roles.find(r => r.id === roleId);
    member.removeRole(roleToRemove1).catch(err => console.log(err));
    const guild2 = client.guilds.find(guild => guild.id === config.server2id);
    const roleToRemove2 = guild2.roles[roleId] !== null  ? guild2.roles.find(r => r.name === roleToRemove1.name) : null;
    let member2 = guild2.members.find(mem => mem.id === member.id);
    if (member2 && roleToRemove2) {
        member2.removeRole(roleToRemove2).catch(err => console.log(err));
        logChannel.send('Removed ' + roleToRemove1.name + ' from ' + member.user.username + ' in ' + guild2.name);
    } else if (!roleToRemove2) {
        logChannel.send('Unable to remove role ' + roleToRemove1.name + ' to ' + member.user.username + ' in ' + guild2.name + ', role does not exist.');
    } else {
        guild2.fetchMembers().then(guild2Updated => {
            let member2Updated = guild2Updated.members.find(mem => mem.id === member.id);
            if (member2Updated && roleToAdd2) {
                member2Updated.addRole(roleToAdd2).catch(err => console.log('err ' + err));
                logChannel.send('Applied ' + roleToAdd1.name + ' to ' + member.user.username + ' in ' + guild2.name);
            } else {
                logChannel.send('Unable to add role ' + roleToAdd1.name + ' to ' + member.user.username + ' in ' + guild2.name + ', member does not exist.');
            }
        });
    }
}

verifyUser = (id) => {
    const guild = client.guilds.find(guild => guild.id === config.server1id);
    let member = guild.members.find(member => member.id === id);

    return member.roles.find(role => role.name === config.commanderRole);
}

client.login(config.token);
  
  