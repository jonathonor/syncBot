1. When user joins main server - do nothing.
2. When user joins synced server - look up roles in main server and apply in synced server
3. When user leaves main server - remove roles in main server from synced servers
4. When user leaves synced server - do nothing
5. When role is added in main server - add role in synced servers
6. When role is removed from main server - remove role in synced servers

ToDo Tasks:
1. Move permissions checks to application commands.
2. Make role-checker more performant.

RoleAnalyze
1. If user has role in main server but not in synced server, add it in synced server
2. If user has role in synced server, but not in main server, remove it in synced server
3. If user does not exist in in main server, remove all roles that exist in main server