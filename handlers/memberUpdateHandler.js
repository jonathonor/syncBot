import { globals } from "../globals.js";
import config from "../config.js";

import { addRole } from "../commands/addRole.js";
import { removeRole } from "../commands/removeRole.js";

export const memberUpdateHandler = (oldMember, updatedMember) => {
    if (!globals.triggeredByIntention && (updatedMember.guild.id === config.mainServer)) {
        const oldRoles = oldMember.roles.cache;
        const newRoles = updatedMember.roles.cache;

        let oldRolesIds = oldRoles.map(r => r.id);
        let newRolesIds = newRoles.map(r => r.id);

        if (oldRolesIds.length > newRolesIds.length) {
            let roleToRemove = oldRoles.filter(role => !newRolesIds.includes(role.id)).first();
            removeRole(updatedMember, roleToRemove.id);
        }

        if (oldRolesIds.length < newRolesIds.length) {
            let roleToAdd = newRoles.filter(role => !oldRolesIds.includes(role.id)).first();
            addRole(updatedMember, roleToAdd.id);
        }
    }
}