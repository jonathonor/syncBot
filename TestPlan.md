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
        -- or remove user if they do not exist in main server?
Notes:
        if (rolesToRemoveInThisServer.length > 0 || rolesToAddInThisServer.length > 0) {
                    hasDifferingRoles = true;
                    let remove = forceSync ? 'rolesRemovedToMatchMainserver' : 'rolesToRemoveToMatchMainserver';
                    let add = forceSync ? 'rolesAddedToMatchMainserver' : 'rolesToAddToMatchMainServer';
                    if (rolesToRemoveInThisServer.length > 0 && rolesToAddInThisServer.length === 0) {
                        debugLog(`Roles to be removed: ${rolesToRemoveInThisServer.map(r => r.name)} from ${memberInFetchedServer.displayName} in ${fetchedServer.name}`)
                        if (forceSync) {
                            await memberInFetchedServer.roles.remove(rolesCollectionToRemoveInThisServer);
                        }

                        memberObj.serversWithDifferingRoles
                        .push({ serverName: fetchedServer.name,
                            [`${remove}`]: rolesToRemoveInThisServer.map(role => role.name),
                        });
                    } 
                    if (rolesToAddInThisServer.length > 0 && rolesToRemoveInThisServer.length === 0) {
                        debugLog(`Roles to be added: ${rolesToAddInThisServer.map(r => r.name)} to ${memberInFetchedServer.displayName} in ${fetchedServer.name}`)
                        if (forceSync) {
                            await memberInFetchedServer.roles.add(rolesCollectionToAddInThisServer);
                        }

                        memberObj.serversWithDifferingRoles
                        .push({ serverName: fetchedServer.name,
                            [`${add}`]: rolesToAddInThisServer.map(role => role.name),
                        });
                    } 
                    if (rolesToAddInThisServer.length > 0 && rolesToRemoveInThisServer.length > 0) {
                        debugLog(`Roles to be added and removed for ${memberInFetchedServer.displayName} in ${fetchedServer.name}`)
                        debugLog(`Add: ${rolesToAddInThisServer.map(r => r.name)}`)
                        debugLog(`Remove: ${rolesToRemoveInThisServer.map(r => r.name)}`)
                        if (forceSync) {
                            debugLog(`Force syncing combination for: ${memberInFetchedServer.displayName}`)
                            await memberInFetchedServer.roles.remove(rolesCollectionToRemoveInThisServer);
                            await memberInFetchedServer.roles.add(rolesCollectionToAddInThisServer);
                        }
    
                        memberObj.serversWithDifferingRoles
                        .push({ serverName: fetchedServer.name,
                            [`${remove}`]: rolesToRemoveInThisServer.map(role => role.name),
                            [`${add}`]: rolesToAddInThisServer.map(role => role.name)
                        });
                    }
                }