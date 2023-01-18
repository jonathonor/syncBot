/**
 * 
 * @param {the interaction from discord command message} interaction 
 * @param {the function to call with each member} action 
 * @param {the function to execute after all members have been processed with the action} callback 
 * @param {any options that need to be passed through to the action or callback} options 
 */
export let iterateThroughMembers = async (interaction, action, callback, options) => {
  let data = { membersAnalyzed: 0, membersWithDifferences: [], errors: [] };
  interaction.guild.members
    .fetch()
    .then(async (members) => {
      for (const member of members.values()) {
          if (member.manageable && !member.user.bot) {
            data = await action(member, interaction, data, options);
          } else {
            let error = `Unable to apply action: ${action.name} to ${member.user.username}`;

            if (!member.manageable) {
              error += ". Member is not manageable."
            }

            if (member.user.bot) {
              error += ". Member is a bot."
            }

            console.log(error);
            data.errors.push(error);
          }
        }
      callback(interaction, data, options);
    })
    .catch(console.log);
};

// Verifies that the user who sent the command has the designated commanderRole from the config file.
export let verifyUser = (id, guildId = config.mainServer) => {
    return client.guilds.fetch(guildId).then(guild => {
        return guild.members.fetch(id).then(member => {
            let matchesRoleName = member.roles.cache.find(r => r.name === config.allowedRoleName);
            debugLog(`VERIFICATION OF ${member.displayName} IN ${guild.name}`)
            debugLog(`Role name matches config: ${!!matchesRoleName}`);
            debugLog(`Role id matches config: ${member._roles.includes(config.allowedRoleId)}`);
            debugLog(`Is guild owner: ${guild.ownerId === member.id}`);

            return member._roles.includes(config.allowedRoleId) || (guild.ownerId === member.id) || !!matchesRoleName;
        }).catch(err => console.log(`VERIFYUSER_MEMBER-FETCH_${id} ERROR: ${err}`));
    }).catch(err => console.log(`VERIFYUSER_GUILD-FETCH_${guildId} ERROR: ${err}`));
}


// Responds to each (/) slash command with outcome of the command, if this was triggered by a client event or an error, it logs the outcome to the log channel denoted in config
export let respondToInteraction = async (interaction, message, error = null) => {
  const mainServer = await interaction.client.guilds.fetch(config.mainServer).catch(err => console.log(`RESPOND_TO_INTERACTION-FETCH_MAINSERVER: ${err}`));
  const logChannel = await mainServer.channels.fetch(config.logChannelId).catch(err => console.log(`RESPOND_TO_INTERACTION-FETCH_LOGCHANNEL: ${err}`));
  if (!!logChannel && (!interaction || interaction.isReplied)) {
      await logChannel.send(message).catch(err => console.log(`RESPOND_TO_INTERACTION-SENDING_TO_LOGCHANNEL ERROR: ${err}`));
  } else {
      interaction.isReplied = true;
      await interaction.reply({ content: message, ephemeral: true }).catch(err => console.log(`RESPOND_TO_INTERACTION-SENDING_RESPONSE ERROR: ${err}`));
  }

  if (error) {
      console.log(error);
  }

  throttleUpdate();
}

let throttleUpdate = () => {
  setTimeout(() => {
      triggeredByIntention = false;
  }, 2000);
}

export let debugLog = (str) => {
  if (isDebug) {
      console.log(str);
  }
}

export let colorLog = (color, message) => {
  //colors 
    // \x1b[91m Red
    // \x1b[93m Yellow
    // \x1b[94m Blue
    // \x1b[0m back to console default
  switch (color) {
    case 'error':
      console.log(`\x1b[91m ${message} \x1b[0m`)
    case 'warning':
      console.log(`\x1b[93m ${message} \x1b[0m`)
    case 'info':
      console.log(`\x1b[94m ${message} \x1b[0m`)
  }
}


