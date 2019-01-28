# syncBot
A bot that syncs roles between two discord servers.

Clone this repo to wherever you want the bot to run.
- example -
    - cd /Documents
    - git clone https://github.com/jonathonor/syncBot.git
    - cd syncBot
    - node run.js

To Create a discord dev application if you don't have one (you need the token)
1. Create a Discord Bot at https://discordapp.com/developers/applications
2. Click New Application
3. On the left hand side click Bot
4. Click Ok
5. Copy Bot Token into config.json
6. Click OAuth2 in the left sidebar
7. Click in the scopes section "bot" and in the bot permissions section "manage roles"
8. Copy the URL in the bottom of the "scopes" section and paste it into your web browser
9. You will need to use the url to invite the bot to both servers you want synced
10. Enable discord developer mode. https://discordia.me/developer-mode
11. Copy the ID's of the servers you want to sync roles between by right clicking the server name
and then clicking "Copy Id"
12. Paste the server id's into the config.json
13. IMPORTANT: Make sure the bot's role in your discord server is located above the roles you want synced in the role heirarchy. (The bots role should be the same name as what you named the bot)

Now you are ready to use the commands to add and remove roles in both servers.
- !add @username @role-name 
    - will add the role with role name to the user in both servers.
- !remove @username @role-name
    - will remove the role with the role name from the user in both servers

