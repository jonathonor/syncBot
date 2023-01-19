import { jest } from "@jest/globals";
import { memberRemoveHandler } from "../handlers/memberRemoveHandler";

describe("Member Remove Handler", () => {
    const mainServerRole = {
        name: "role1"
    };

    const logChannel = {
        send: jest.fn()
    }

    const removedMember = {
        displayName: "Member 1",
        guild: {
            name: "Main Server",
            id: "1",
            channels: {
                fetch: jest.fn().mockReturnValue(logChannel)
            },
            members: {
                fetch: jest.fn()
            },
            roles: {
                fetch: jest.fn().mockReturnValue(mainServerRole)
            }
        },
        roles: {
            fetch: jest.fn().mockReturnValue(mainServerRole),
            remove: jest.fn()
        }
    };

    // when a member leaves the main server
    // for each of the synced servers, if this member exists there, 
    // for each role name the user had in the main server, the bot should remove the role 
    it("if member leaves the main server, role is removed from member in each synced server, and logchannel message is sent", async () => {
        memberRemoveHandler(removedMember);
        expect();
    });

    it("if member leaves the  main server, if user only has role that is premium (nitro), no roles are removed from synced servers", async () => {
        memberRemoveHandler(removedMember);
        expect();
    });

    it("if member leaves the main server, if user only has role that is higher than bots, no roles are removed from synced servers", async () => {
        memberRemoveHandler(removedMember);
        expect();
    });

    it("if member is not in main server, no roles are removed, and logchannel message is sent", async () => {
        memberRemoveHandler(removedMember);
        expect();
    });

    it("does not try to add @everyone role", async () => {
        memberRemoveHandler(removedMember);
        expect();
    });

    it("does not try to add nitro boosted role", async () => {
        memberRemoveHandler(removedMember);
        expect();
    });

    it("does not try to add role that is higher than bots role", async () => {
        memberRemoveHandler(removedMember);
        expect();
    });
});