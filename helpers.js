import { globals, isDebug } from "./globals.js";
import config from "./config.js";

/**
 * 
 * @param {the interaction from discord command message} interaction 
 * @param {the function to call with each member} action 
 * @param {the function to execute after all members have been processed with the action} callback 
 * @param {any options that need to be passed through to the action or callback} options 
 */
export const iterateThroughMembers = async (interaction, action, callback, options) => {
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

// Responds to each (/) slash command with outcome of the command, if this was triggered by a client event or an error, it logs the outcome to the log channel denoted in config
export const respondToInteraction = async (interaction, message, error = null) => {
  const mainServer = await globals.client.guilds.fetch(config.mainServer).catch(err => console.log(`RESPOND_TO_INTERACTION-FETCH_MAINSERVER: ${err}`));
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
      globals.triggeredByIntention = false;
  }, 2000);
}

export const debugLog = (str) => {
  if (isDebug) {
      console.log(str);
  }
}

export const colorLog = (color, message) => {
  //colors 
    // \x1b[91m Red
    // \x1b[93m Yellow
    // \x1b[94m Blue
    // \x1b[0m back to console default
  switch (color) {
    case 'error':
      console.log(`\x1b[91m ${message} \x1b[0m`); break;
    case 'warning':
      console.log(`\x1b[93m ${message} \x1b[0m`); break;
    case 'info':
      console.log(`\x1b[94m ${message} \x1b[0m`); break;
    default: 
      console.log(message);
  }
}


