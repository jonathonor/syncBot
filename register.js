const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
var config = require('./config.json')

const commands = [{
  name: 'add',
  description: 'Will add the role to the user in both servers.',
  options: [{
        "name": "role",
        "description": "The role to add in both servers",
        "type": 8,
        "required": true
    },
    {
        "name": "user",
        "description": "The user to add the role to in both servers",
        "type": 6,
        "required": true
    }]
}, {
    name: 'remove',
    description: 'Will remove the role from the user in both servers.',
    options: [{
          "name": "role",
          "description": "The role to remove in both servers",
          "type": 8,
          "required": true
      },
      {
          "name": "user",
          "description": "The user to remove the role to in both servers",
          "type": 6,
          "required": true
      }]
  }]; 

const rest = new REST({ version: '9' }).setToken(config.token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.mainServer),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();