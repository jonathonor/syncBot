import { jest } from "@jest/globals";
import { Collection } from "discord.js";
import { memberUpdateHandler } from "../handlers/memberUpdateHandler";

describe("Member Update Handler", () => {
    const roleCache = new Map();
    roleCache.set('1', {
        id: "1",
        name: "Main Server"
    });

    const mainServerRole = {
        name: "role1"
    }

    const mainServerMember = {
        displayName: "Member 1",
        roles: {
            cache: new Collection(roleCache.entries()),
            remove: jest.fn()
        }
    }

    const mainServer = {
        members: {
            fetch: jest.fn().mockReturnValue(mainServerMember)
        },
        roles: {
            fetch: jest.fn().mockReturnValue(mainServerRole)
        }
    }

    const originalMember = {
        roles: {
            cache: new Collection(roleCache.entries()),
        }
    };

    const updatedMember = {
        roles: {
            cache: new Collection(roleCache.entries()),
            remove: jest.fn()
        },
        guild: {
            name: "Main Server",
            id: "1"
        },
        client: {
            guilds: {
                // don't alway return mainServer, do a spy and check for id val passed in
                fetch: jest.fn().mockReturnValue(mainServer)
            }
        }
    };

    it("if role is added to user in main server, role is added in each synced server", async () => {
        await memberUpdateHandler(originalMember, updatedMember);
        expect();
    });

    it("if role is removed from user in main server, role is removed in each synced server", async () => {
        await memberUpdateHandler(originalMember, updatedMember);
        expect();
    });
});