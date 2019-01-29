# syncBot
A bot that syncs roles between two discord servers.

Clone this repo to wherever you want the bot to run.
- example :
    - cd /Documents
    - git clone https://github.com/jonathonor/syncBot.git
    - cd syncBot
    - npm install discord.js
    - node run.js

To Create a discord dev application if you don't have one (you need the token)
1. Create a Discord Bot at https://discordapp.com/developers/applications
2. Click New Application
3. On the left hand side click Bot
4. Click Ok
5. Copy Bot Token into config.json
6. Click OAuth2 in the left sidebar
7. Click in the scopes section "bot" and in the bot permissions section "manage roles" & "view audit log"
8. Copy the URL in the bottom of the "scopes" section and paste it into your web browser
9. You will need to use the url to invite the bot to both servers you want synced
10. Enable discord developer mode. https://discordia.me/developer-mode
11. Copy the ID's of the servers you want to sync roles between by right clicking the server name
and then clicking "Copy Id"
12. Paste the server id's into the config.json
13. IMPORTANT: Make sure the bot's role in your discord server is located above the roles you want synced in the role heirarchy. (The bots role should be the same name as what you named the bot)
14. The roles you are syncing across servers should be set to "Allow anyone to mention this role" in server1
15. Add commanderRole name of role that you allow to add/remove roles e.g. (Admin)

Now you are ready to use the commands to add and remove roles in both servers.
- !add @username @role-name 
    - will add the role with role name to the user in both servers.
- !remove @username @role-name
    - will remove the role with the role name from the user in both servers

In addition to manually adding roles with both commands above any role add/removal in server1
will be applied in server 2 automatically if the user and role exists in server2.

Important Final Notes:<br>
Make sure that the role being synced accross server1 -> server2 have the same exact name. Including capitals.<br>
Make sure that the bot has read message / send message permissions on the log channel you create.<br>
Make sure that the bots role is located higher in the heirarchy than all other discord roles you want it to assign.

