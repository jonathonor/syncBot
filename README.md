# syncBot

Note - I have recently updated this bot on October 12, 2021 after years of neglect. If you experience any issues, please report an issue here on github and I will have a look!

A bot that syncs roles between one main server, and multiple other discord servers.

This bot will sync roles with names across multiple additional discord servers you have configured. See the below cases to further understand functionality.

Use cases:
Manual Operations
1. You have a user in your main server, and you use the discord UI to give the user role1, the bot will look up any role named "role1" in each additional server and give the user that role in each of the additional servers as well.
2. You have a user in your main server, and you use the /add command with @role1 @username, the bot will look up the role named "role1" in each additional server and give the user that role in each of the additional servers as well.
3. You have a user in your main server, and you use the discord UI to remove role1 from the user, the bot will see if the user exists in each of the additional servers, and will remove the role from them there as well.
4. You have a user in your main server, and you use the /remove command with @role1 @username, the bot will see if the user exists in each of the additinoal servers, and will remove the role from them there as well.

Automatic Operations
1. You have a user in your main server, and you invite them to an additional server. When the user joins the additional server, any roles that they have in the main server will be applied automatically to them on join of the additional server. i.e. Jim is part of the mainserver and has role1, and then Jim joins a synced server. Jim automatically has role1 upon joining the secondary server.
2. You have a user in your main server, and you remove them from the server, or they leave the main server. All roles that the user has in the main server are removed from the user in all additional synced servers. i.e. Jim is part of the mainserver and has role1, and role2, when Jim is kicked, or leaves the mainserver, but stays in any additional servers, he will no longer have role1 or role2 in any additional server. He also will not have role1 or role2 upon rejoining the mainserver until they are given back to him.

Clone this repo to wherever you want the bot to run.
- example :
    - cd /Documents
    - git clone https://github.com/jonathonor/syncBot.git
    - cd syncBot
    - npm install discord.js @discordjs/rest discord-api-types axios 
    - node register.js (this registers the /add /remove slash commands for your server)
    - node run.js

To Create a discord dev application if you don't have one (you need the token)
1. Create a Discord Bot at https://discordapp.com/developers/applications
2. Click New Application
3. On the left hand side click Bot
4. Click Ok
5. Copy Bot Token into config.json, and copy Bot Client Id into config.json
6. Enable Server Members Intent (so that we can sync roles as new members join and leave the servers)
7. Click OAuth2 in the left sidebar
8. Click in the scopes section "bot" and in the bot permissions section "manage roles" & "view audit log"
9. Copy the URL in the bottom of the "scopes" section and paste it into your web browser
10. You will need to use the url to invite the bot to both servers you want synced
11. Enable discord developer mode. https://discordia.me/developer-mode
12. Copy the ID's of the servers you want to sync roles between by right clicking the server name
and then clicking "Copy Id"
13. Paste the server id's into the config.json
14. IMPORTANT: Make sure the bot's role in your discord server is located above the roles you want synced in the role heirarchy. (The bots role should be the same name as what you named the bot)
15. The roles you are syncing across servers should be set to "Allow anyone to mention this role" in server1
16. Add commanderRole name of role that you allow to add/remove roles e.g. (Admin)

Now you are ready to use the commands to add and remove roles in both servers.
- /add @username @role-name 
    - will add the role with role name to the user in synced servers.
- /remove @username @role-name
    - will remove the role with the role name from the user in synced servers

Important Final Notes:<br>
Make sure that the role being synced accross server1 -> server2 have the same exact name. Including capitals.<br>
Make sure that the bot has read message / send message permissions on the log channel you create.<br>
Make sure that the bots role is located higher in the heirarchy than all other discord roles you want it to assign.

