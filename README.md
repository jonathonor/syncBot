# syncBot
run.js - A bot that syncs roles between one main server, and multiple other discord servers.
runReverse.js - A bot that sync roles between multiple synced servers, and one main server.

Walkthrough videos - Original syncBot
 - I host the bot and you simply invite it to your server and run a few commands
        - https://youtu.be/lB6F_uMiEWk
 - You host the bot and I walk you through the setup instructions
        - https://youtu.be/OMe9bAKuApQ

Walkthrough videos - Reverse syncBot
 - I host the bot and you simply invite it to your server and run a few commands
        - coming soon
 - You host the bot and I walk you through the setup instructions
        - coming soon

Reach me on my discord server 
    - https://discord.gg/f8SUVvQZD3

This bot will sync roles with names across multiple additional discord servers you have configured. See the below cases to further understand functionality.

Use cases:
Manual Operations
1. You have a user in your main server, and you use the discord UI to give the user role1, the bot will look up any role named "role1" in each additional server and give the user that role in each of the additional servers as well.
2. You have a user in your main server, and you use the /add command with @role1 @username, the bot will look up the role named "role1" in each additional server and give the user that role in each of the additional servers as well.
3. You have a user in your main server, and you use the discord UI to remove role1 from the user, the bot will see if the user exists in each of the additional servers, and will remove the role from them there as well.
4. You have a user in your main server, and you use the /remove command with @role1 @username, the bot will see if the user exists in each of the additinoal servers, and will remove the role from them there as well.
5. Your bot has gone down at some point and you don't know what roles each user has in your synced servers.
 - You can run the role-checker command with the analyze option which sends you a file detailing the differences between your users roles in each server.
 - You can run the role-checker command with the force-sync option which will return all users in all synced servers roles to match the main server roles they have.

Automatic Operations
1. You have a user in your main server, and you invite them to an additional server. When the user joins the additional server, any roles that they have in the main server will be applied automatically to them on join of the additional server. i.e. Jim is part of the mainserver and has role1, and then Jim joins a synced server. Jim automatically has role1 upon joining the secondary server.
2. You have a user in your main server, and you remove them from the server, or they leave the main server. All roles that the user has in the main server are removed from the user in all additional synced servers. i.e. Jim is part of the mainserver and has role1, and role2, when Jim is kicked, or leaves the mainserver, but stays in any additional servers, he will no longer have role1 or role2 in any additional server. He also will not have role1 or role2 upon rejoining the mainserver until they are given back to him.

Clone this repo to wherever you want the bot to run.
- requirements :
    - node v16.11.1 
    - discord.js v13.2.0
- example :
    - cd /Documents
    - git clone https://github.com/jonathonor/syncBot.git
    - cd syncBot
    - npm install discord.js @discordjs/rest discord-api-types axios 
    - follow the config steps below to populate the config.json file before executing the next two commands
    - node register.js (this registers the /add /remove slash commands for your server)
    - node run.js

To Create a discord dev application if you don't have one (you need the token)
1. Create a Discord Bot at https://discord.com/developers/applications
2. Click New Application
3. Enable Server Members Intent and Presence Intent(so that we can sync roles as new members join and leave the servers)
4. On the left hand side click Bot
5. Click Ok
6. Copy Bot Token into config.json
7. Click OAuth2 in the left sidebar, copy bot client dd into config.json
8. Click OAuth2 in the left sidebar, Url Generator
10. Click in the scopes section "bot" and "application.commands" and in the bot permissions section "manage roles" & "view audit log"
11. Copy the URL in the bottom of the "scopes" section and paste it into your web browser
12. You will need to use the url to invite the bot to BOTH servers you want synced
13. Enable discord developer mode. (In discord, click the settings cog -> Advanced -> Developer Mode Toggle)
14. Copy the id of the main server into config.json "mainServer" this will be the server that you manage roles on for all servers.
15. Copy the id(s) of the servers you want to sync roles between by right clicking each of the additional server names
and then clicking "Copy Id" (delete the extra entry in the example config.json if you are only syncing one server)
14. IMPORTANT: Make sure the bot's role in ALL of your discord servers is located above the roles you want synced in the role heirarchy. (The bots role should be the same name as what you named the bot)
15. The roles you are syncing across servers should be set to "Allow anyone to mention this role" in server1
16. Add id of role that you allow to add/remove roles in config.json in allowedRoleId e.g. (the id of the Admin role in your server)

Now you are ready to use the commands to add and remove roles in both servers and the auto features will start working.
- /add @username @role-name 
    - will add the role with role name to the user in synced servers.
- /remove @username @role-name
    - will remove the role with the role name from the user in synced servers
- /role-checker 
    - analyze - will send a file to you in DM detailing role differences of your users accross your servers
    - force-sync - will force sync all users roles in the synced servers to match the main server roles they have
    

Important Final Notes:<br>
Make sure that the role being synced accross server1 -> server2 have the same exact name. Including capitals.<br>
Make sure that the bot has read message / send message permissions on the log channel you create.<br>
Make sure that the bots role is located higher in the heirarchy than all other discord roles you want it to assign.

