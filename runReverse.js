/* 
    syncBot, a super simple bot that gives you the ability to add/remove a role of a 
    member in two servers at the same time.
*/

// Use cases:
// 1. User role is added in a synced server manually, if the user exists in the main server, any role with the same name will be applied in the main server
// 2. User role is added via slash command in a synced server, if the user exists in the main server, the bot will apply the role with the same name in the main server
// 3. User role is removed in a synced server manually, any role with the same name is removed from the user in the main server
// 4. User role is removed via slash command in a synced server, any role with the same name is removed from the user in the main server
// 5. User is added to the main server, roles that match names of roles the user has in any synced server are applied to the user in the main server
// 6. User is removed from a synced server, role names that the user has in the synced server are removed from the main server
import { createRequire } from "module";
const require = createRequire(import.meta.url);
var config = require("./config.json");
import { Client, GatewayIntentBits } from "discord.js";
import { iterateThroughMembers } from "./helpers.js";
const axios = require("axios");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});
// This is to keep the action from firing twice when using the (/) command, since the guildMemberUpdate will see the role update and fire the add/remove again.
let triggeredByIntention = false;

client.on("ready", () => {
  //TODO: Add validation of the config file
  console.log(`syncbot ready!`);
});

client.on("interactionCreate", async (interaction) => {
  // 2 === APPLICATION_COMMAND
  if (interaction.type !== 2) return;

  if (interaction.commandName === "add") {
    verifyUser(interaction.member.id).then(async (verified) => {
      if (verified) {
        let member = interaction.options.getMember("user");
        let role = interaction.options.getRole("role");
        triggeredByIntention = true;
        addRole(member, role.id, interaction);
      } else {
        respondToInteraction(
          interaction,
          `You dont have the necessary role to send that command ${interaction.user.username}`
        );
      }
    });
  }

  if (interaction.commandName === "remove") {
    verifyUser(interaction.member.id).then(async (verified) => {
      if (verified) {
        let member = interaction.options.getMember("user");
        let role = interaction.options.getRole("role");
        triggeredByIntention = true;
        removeRole(member, role, interaction);
      } else {
        respondToInteraction(
          interaction,
          `You dont have the necessary role to send that command ${interaction.user.username}`
        );
      }
    });
  }

  if (interaction.commandName === "role-checker") {
    verifyUser(interaction.member.id).then(async (verified) => {
      if (verified) {
        let option = interaction.options.data.find(
          (obj) => obj.name === "option"
        ).value;
        triggeredByIntention = true;
        if (option === "analyze") {
          await iterateThroughMembers(
            interaction,
            roleAnalyze,
            roleAnalyzeCallback
          );
        } else if (option === "force") {
          await iterateThroughMembers(
            interaction,
            roleAnalyze,
            roleAnalyzeCallback,
            true
          );
        }
      } else {
        respondToInteraction(
          interaction,
          `You dont have the necessary role to send that command ${interaction.user.username}`
        );
      }
    });
  }
});

let roleAnalyze = async (member, interaction, data, forceSync = false) => {
  await interaction.deferReply();
  let memberMainserverRolesCollection = member.roles.cache;
  let memberMainServerRolesArrayStrings = memberMainserverRolesCollection.map(
    (role) => role.name
  );
  let memberObj = {
    username: member.displayName,
    serversWithDifferingRoles: [],
  };
  let hasDifferingRoles = false;

  for (const server of config.syncedServers) {
    const fetchedServer = await client.guilds.fetch(server);
    const fetchedServerRoles = await fetchedServer.roles.fetch();
    if (fetchedServer.ownerId === interaction.member.id) {
      let membersInFetchedServer = await fetchedServer.members.fetch();
      let memberInFetchedServer = membersInFetchedServer.get(member.id);
      if (memberInFetchedServer) {
        let membersRolesInFetchedServer = memberInFetchedServer.roles.cache;
        let membersRolesInFetchedServerAsStrings =
          membersRolesInFetchedServer.map((role) => role.name);
        // Roles that need removed from the user in the fetched server to match the roles the user has in the main server
        let rolesCollectionToRemoveInThisServer =
          membersRolesInFetchedServer.filter(
            (r) => !memberMainServerRolesArrayStrings.includes(r.name)
          );
        // Roles that need added to the user in the fetched server to match the roles the user has in the main server
        let rolesCollectionToAddInThisServer = memberMainserverRolesCollection
          .filter((r) => !membersRolesInFetchedServerAsStrings.includes(r.name))
          // must map the role over to the one in synced server for add
          .map(
            (role) =>
              fetchedServerRoles.find((r) => r.name === role.name) || role
          );

        let rolesToRemoveInThisServer = [
          ...rolesCollectionToRemoveInThisServer.values(),
        ];
        let rolesToAddInThisServer = [
          ...rolesCollectionToAddInThisServer.values(),
        ];
        if (
          rolesToRemoveInThisServer.length > 0 ||
          rolesToAddInThisServer.length > 0
        ) {
          hasDifferingRoles = true;
          let remove = forceSync
            ? "rolesRemovedToMatchMainserver"
            : "rolesToRemoveToMatchMainserver";
          let add = forceSync
            ? "rolesAddedToMatchMainserver"
            : "rolesToAddToMatchMainServer";
          if (
            rolesToRemoveInThisServer.length > 0 &&
            rolesToAddInThisServer.length === 0
          ) {
            if (forceSync) {
              memberInFetchedServer.roles.remove(
                rolesCollectionToRemoveInThisServer
              );
            }

            memberObj.serversWithDifferingRoles.push({
              serverName: fetchedServer.name,
              [`${remove}`]: rolesToRemoveInThisServer.map((role) => role.name),
            });
          }
          if (
            rolesToAddInThisServer.length > 0 &&
            rolesToRemoveInThisServer.length === 0
          ) {
            if (forceSync) {
              memberInFetchedServer.roles.add(rolesCollectionToAddInThisServer);
            }

            memberObj.serversWithDifferingRoles.push({
              serverName: fetchedServer.name,
              [`${add}`]: rolesToAddInThisServer.map((role) => role.name),
            });
          }
          if (
            rolesToAddInThisServer.length > 0 &&
            rolesToRemoveInThisServer.length > 0
          ) {
            if (forceSync) {
              await memberInFetchedServer.roles.remove(
                rolesCollectionToRemoveInThisServer
              );
              await memberInFetchedServer.roles.add(
                rolesCollectionToAddInThisServer
              );
            }

            memberObj.serversWithDifferingRoles.push({
              serverName: fetchedServer.name,
              [`${remove}`]: rolesToRemoveInThisServer.map((role) => role.name),
              [`${add}`]: rolesToAddInThisServer.map((role) => role.name),
            });
          }
        }
      }
    }
  }

  if (hasDifferingRoles) {
    data.membersWithDifferences.push(memberObj);
  }

  data.membersAnalyzed++;

  return data;
};
/**
 *
 * @param {the interaction from the original command} interaction
 * @param {the data procured by running the action on each member} data
 * @param {whether we are just analyzing roles, or force syncing} forceSync
 */
let roleAnalyzeCallback = (interaction, data, forceSync) => {
  interaction.user
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
    })
    .then(async () => {
      let analyzed = `I went through and compared roles for ${data.membersAnalyzed} members. I sent you the results in a DM.`;
      let forced = `I went through and synced roles for ${data.membersAnalyzed} members. I sent you a report in a DM.`;
      return await interaction.editReply({
        content: forceSync ? forced : analyzed,
        ephemeral: true,
      });
    });

  throttleUpdate();
};

// Manual function registered to (/) slash command to add a role from a user in the synced server and main server
let addRole = async (member, role, interaction = null) => {
  const mainServer = await client.guilds
    .fetch(config.mainServer)
    .catch((e) => console.log(`ADDROLE_MAINSERVER_FETCH Error: ${e}`));
  const mainServerRoles = await mainServer.roles
    .fetch(role)
    .catch((e) => console.log(`ADDROLE_MAINSERVER-ROLE_FETCH Error: ${e}`));
  const serverCommandWasInRoleToAdd = await member.guild.roles
    .fetch(role)
    .catch((e) => console.log(`ADDROLE_SYNCEDSERVER-ROLE_FETCH Error: ${e}`));

  mainServer.members
    .fetch(member.id)
    .then((mainServerMember) => {
      const mainServerRoleToAdd = mainServerRoles.find(
        (r) => r.name === serverCommandWasInRoleToAdd.name
      );
      member.roles
        .add(serverCommandWasInRoleToAdd)
        .then(() => {
          mainServerMember.roles
            .add(mainServerRoleToAdd)
            .then(() => {
              respondToInteraction(
                interaction,
                `Added ${mainServerRoleToAdd.name} to ${mainServerMember.user.username} in ${mainServer.name}`
              );
            })
            .catch((err) =>
              respondToInteraction(
                interaction,
                `There was an error adding the role in main server: ${mainServer.name}, see console for error`,
                err
              )
            );
        })
        .catch((err) =>
          respondToInteraction(
            interaction,
            "There was an error adding the role in this synced server, see console for error",
            err
          )
        );
    })
    .catch(() =>
      respondToInteraction(
        interaction,
        `Unable to add ${serverCommandWasInRoleToAdd.name} to ${member.user.username} in ${mainServer.name} since the user is not in that server.`
      )
    );
};

// Manual function registered to (/) slash command to remove a role from a user in the synced server and main server
let removeRole = async (member, role, interaction = null) => {
  const mainServer = await client.guilds
    .fetch(config.mainServer)
    .catch((e) => console.log(`REMOVEROLE_MAINSERVER_FETCH Error: ${e}`));
  const mainServerRoles = await mainServer.roles
    .fetch()
    .catch((e) => console.log(`REMOVEROLE_MAINSERVER-ROLES_FETCH Error: ${e}`));
  const serverCommandWasInRoleToRemove = member.roles.resolve(role);

  mainServer.members
    .fetch(member.id)
    .then((mainServerMember) => {
      const mainServerRoleToRemove = mainServerRoles.find(
        (r) => r.name === serverCommandWasInRoleToRemove.name
      );
      member.roles
        .remove(serverCommandWasInRoleToRemove)
        .then(() => {
          mainServerMember.roles
            .remove(mainServerRoleToRemove)
            .then(() => {
              respondToInteraction(
                interaction,
                `Removed ${mainServerRoleToRemove.name} from ${mainServerMember.user.username} in ${mainServer.name}`
              );
            })
            .catch((err) =>
              respondToInteraction(
                interaction,
                `There was an error removing the role in main server: ${mainServer.name}, see console for error`,
                err
              )
            );
        })
        .catch((err) =>
          respondToInteraction(
            interaction,
            "There was an error removing the role in this synced server, see console for error",
            err
          )
        );
    })
    .catch(() =>
      respondToInteraction(
        interaction,
        `Unable to remove ${serverCommandWasInRoleToRemove.name} from ${member.user.username} in ${mainServer.name} since the user is not in that server.`
      )
    );
};

let throttleUpdate = () => {
  setTimeout(() => {
    triggeredByIntention = false;
  }, 2000);
};

// Verifies that the user who sent the command has the designated commanderRole from the config file.
let verifyUser = (id) => {
  return client.guilds
    .fetch(config.mainServer)
    .then((guild) => {
      return guild.members
        .fetch(id)
        .then((member) => {
          return (
            member.roles.cache.find(
              (r) => r.name === config.allowedRoleName
            ) !== undefined || guild.ownerId === member.id
          );
        })
        .catch((err) => `VERIFYUSER_MEMBER_FETCH: ${err}`);
    })
    .catch((err) => `VERIFYUSER_CLIENT_GUILDS_FETCH: ${err}`);
};

// Responds to each (/) slash command with outcome of the command, if this was triggered by a client event or an error, it logs the outcome to the log channel denoted in config
let respondToInteraction = async (interaction, message, error = null) => {
  if (!interaction) {
    const mainServer = await client.guilds.fetch(config.mainServer);
    const logChannel = await mainServer.channels.fetch(config.logChannelId);
    logChannel.send(message);
  } else {
    let url = `https://discord.com/api/v8/interactions/${interaction.id}/${interaction.token}/callback`;

    let json = {
      type: 4,
      data: {
        content: message,
      },
    };

    axios.post(url, json);
  }

  if (error) {
    console.log(error);
  }

  throttleUpdate();
};

// When a users roles are updated in a synced server, update them in the main server.
client.on("guildMemberUpdate", async (oldMember, newMember) => {
  if (
    !triggeredByIntention &&
    config.syncedServers.includes(newMember.guild.id)
  ) {
    let oldRoles = oldMember._roles;
    let newRoles = newMember._roles;

    if (oldRoles.length > newRoles.length) {
      let roleToRemoveId = oldRoles.filter((id) => !newRoles.includes(id))[0];
      removeRole(newMember, oldMember.roles.cache.get(roleToRemoveId));
    }

    if (oldRoles.length < newRoles.length) {
      let roleToAddId = newRoles.filter((id) => !oldRoles.includes(id))[0];
      addRole(newMember, roleToAddId);
    }
  }
});

// When a new user joins the main server, then look for that users roles in the synced servers and apply them in the main server.
client.on("guildMemberAdd", async (addedMember) => {
  if (config.mainServer === addedMember.guild.id) {
    const mainServer = addedMember.guild;
    let mainServerMember = addedMember;
    let mainServerRoles = await mainServer.roles
      .fetch()
      .catch((e) =>
        console.log(`GUILDMEMBERADD_MAINSERVER-ROLES_FETCH Error: ${e}`)
      );
    const logChannel = await mainServer.channels
      .fetch(config.logChannelId)
      .catch((e) => console.log(`GUILDMEMBERADD_LOGCHANNEL_FETCH Error: ${e}`));

    for (const server of config.syncedServers) {
      const guildToSync = await client.guilds
        .fetch(server)
        .catch((e) =>
          console.log(`GUILDMEMBERADD_SYNCEDSERVER_FETCH Error: ${e}`)
        );
      let memberToSync = await guildToSync.members
        .fetch(addedMember.user.id)
        .catch((e) => console.log(`GUILDMEMBERADD_MEMBER_FETCH Error: ${e}`));
      if (memberToSync) {
        let thisServerRoles = [...memberToSync.roles.cache.values()].filter(
          (r) => r.name !== "@everyone"
        );
        if (thisServerRoles.length > 0) {
          thisServerRoles.forEach((role) => {
            let roleToAdd = mainServerRoles.find((r) => r.name === role.name);
            if (roleToAdd && roleToAdd.id && roleToAdd.name) {
              mainServerMember.roles
                .add(roleToAdd)
                .catch((e) =>
                  console.log(`GUILDMEMBERADD_ROLE_ADD Error: ${e}`)
                );
            }
          });
          await logChannel
            .send(
              `Syncing roles from server: ${guildToSync.name} for new member: ${mainServerMember.user.username}`
            )
            .catch((err) => `GUILDMEMBERADD_LOGCHANNEL_SEND: ${err}`);
        }
      }
    }
  }
});

// When a user leaves a synced server, then remove all of matching roles from the main server.
client.on("guildMemberRemove", async (removedMember) => {
  if (config.syncedServers.includes(removedMember.guild.id)) {
    const mainServer = await client.guilds
      .fetch(config.mainServer)
      .catch((err) => `GUILDMEMBERREMOVE-MAINSERVER_FETCH: ${err}`);
    const mainServerRoles = await mainServer.roles
      .fetch()
      .catch((err) => `GUILDMEMBERREMOVE-MAINSERVER_ROLES_FETCH: ${err}`);
    const mainServerMember = await mainServer.members
      .fetch(removedMember.user.id)
      .catch((err) => `GUILDMEMBERREMOVE-MEMBER_FETCH: ${err}`);
    const logChannel = await mainServer.channels
      .fetch(config.logChannelId)
      .catch((err) => `GUILDMEMBERREMOVE-MAINSERVER_LOGCHANNEL_FETCH: ${err}`);

    let syncedServerMemberRoles = removedMember.roles.cache;

    if (mainServerMember) {
      for (const [roleId, role] of syncedServerMemberRoles.entries()) {
        let roleToRemove = mainServerRoles.find(
          (r) => r.name === role.name && r.name !== "@everyone"
        );

        if (roleToRemove) {
          await mainServerMember.roles
            .remove(roleToRemove)
            .catch((err) => `GUILDMEMBERREMOVE_ROLE: ${err}`);
          await logChannel
            .send(
              `Removing roles from: ${mainServerMember.user.username} in server: ${mainServer.name} since they left a synced server: ${removedMember.guild.name}`
            )
            .catch((err) => `GUILDMEMBERREMOVE_LOGCHANNEL_SEND: ${err}`);
        }
      }
    } else {
      await logChannel
        .send(
          `Not removing roles from: ${removedMember.username} in mainserver since they aren't in the server.`
        )
        .catch(
          (err) => `GUILDMEMBERREMOVE-MAINSERVERROLES_LOGCHANNEL_SEND: ${err}`
        );
    }
  }
});

client.login(config.token);
