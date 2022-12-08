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


