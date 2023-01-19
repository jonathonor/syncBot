import { jest } from "@jest/globals";
import { Collection } from "discord.js";
import { memberRemoveHandler } from "../handlers/memberRemoveHandler";

describe("Member Remove Handler", () => {
    const logChannel = {
        send: jest.fn(() => Promise.resolve())
    }

    const roles = new Map();
    roles.set('1', {
        id: "1",
        name: "role1"
    });

    const memberToSync = {
        id: "1",
        displayName: "Member 1",
        roles: {
            remove: jest.fn(() => Promise.resolve()),
        },
        user: {
            id: "1"
        }
    };

    const mainServerRoles = new Collection(roles.entries());

    const mainServer = {
        name: "Main Server",
        id: "1",
        channels: {
            fetch: jest.fn(() => Promise.resolve(logChannel))
        },
        members: {
            fetch: jest.fn(() => Promise.resolve(memberToSync))
        },
        roles: {
            fetch: jest.fn(() => Promise.resolve(mainServerRoles)),
        }
    };

    const removedMember = {
        client: {
            guilds: {
                fetch: jest.fn(() => Promise.resolve(mainServer))
            }
        },
        displayName: "Member 1",
        guild: mainServer,
        roles: {
            fetch: jest.fn(() => Promise.resolve(mainServerRoles)),
            remove: jest.fn()
        },
        user : {
            id: "1"
        }
    };

    // when a member leaves the main server
    // for each of the synced servers, if this member exists there, 
    // for each role name the user had in the main server, the bot should remove the role 
    it("if member leaves the main server, role is removed from member in each synced server, and logchannel message is sent", async () => {
        await memberRemoveHandler(removedMember);
        expect();
    });

    it("if member leaves the  main server, if user only has role that is premium (nitro), no roles are removed from synced servers", async () => {
        await memberRemoveHandler(removedMember);
        expect();
    });

    it("if member leaves the main server, if user only has role that is higher than bots, no roles are removed from synced servers", async () => {
        await memberRemoveHandler(removedMember);
        expect();
    });

    it("if member is not in main server, no roles are removed, and logchannel message is sent", async () => {
        await memberRemoveHandler(removedMember);
        expect();
    });

    it("does not try to add @everyone role", async () => {
        await memberRemoveHandler(removedMember);
        expect();
    });

    it("does not try to add nitro boosted role", async () => {
        await memberRemoveHandler(removedMember);
        expect();
    });

    it("does not try to add role that is higher than bots role", async () => {
        await memberRemoveHandler(removedMember);
        expect();
    });
});