import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import config from "./config";

const commands = [{
  name: 'add',
  description: 'Will add the role to the user in all servers.',
  options: [{
        "name": "role",
        "description": "The role to add in all servers",
        "type": 8,
        "required": true
    },
    {
        "name": "user",
        "description": "The user to add the role to in all servers",
        "type": 6,
        "required": true
    }]
}, {
    name: 'remove',
    description: 'Will remove the role from the user in all servers.',
    options: [{
          "name": "role",
          "description": "The role to remove in all servers",
          "type": 8,
          "required": true
      },
      {
          "name": "user",
          "description": "The user to remove the role to in all servers",
          "type": 6,
          "required": true
      }]
  }, {
    "name": "role-checker",
    "type": 1,
    "description": "A role checker to compare roles between the main server and synced servers.",
    "options": [
        {
            "name": "option",
            "description": "Analyze sends a DM with the differences, force-sync will apply the changes shown in the analysis",
            "type": 3,
            "required": true,
            "choices": [
                {
                    "name": "analyze",
                    "value": "analyze"
                },
                {
                    "name": "force-sync",
                    "value": "force"
                }
            ]
        }
    ]
}]; 

const rest = new REST({ version: '9' }).setToken(config.token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // TODO: do we want global, or for each of the synced servers if logic reversed
    await rest.put(
      Routes.applicationCommands(config.applicationId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();