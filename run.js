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
        let member = msg.mentions.members.first();
        let role = msg.mentions.roles.first();
        addRole(member, role);
    }
    if (msg.content.startsWith('!remove')) {
        let member = msg.mentions.members.first();
        let role = msg.mentions.roles.first();
        removeRole(member, role);
    }
});

addRole = (member, role) => {
    const guild1 = client.guilds.find(guild => guild.id === config.server1id);
    const roleToAddId1 = guild1.roles.find(r => r.id === role.id);
    member.addRole(roleToAddId1).catch(err => console.log(err));
    const guild2 = client.guilds.find(guild => guild.id === config.server2id);
    const roleToAddId2 = guild2.roles.find(r => r.name === role.name);
    let member2 = guild2.members.find(mem => mem.id === member.id);
    if (member2) {
        member2.addRole(roleToAddId2).catch(err => console.log(err));
    }
}

removeRole = (member, role) => {
    const guild1 = client.guilds.find(guild => guild.id === config.server1id);
    const roleToAddId1 = guild1.roles.find(r => r.id === role.id);
    member.removeRole(roleToAddId1).catch(err => console.log(err));
    const guild2 = client.guilds.find(guild => guild.id === config.server2id);
    const roleToAddId2 = guild2.roles.find(r => r.name === role.name);
    let member2 = guild2.members.find(mem => mem.id === member.id);
    if (member2) {
        member2.removeRole(roleToAddId2).catch(err => console.log(err));
    }
}

client.login(config.token);
  
  