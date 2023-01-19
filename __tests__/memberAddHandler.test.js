import { memberAddHandler } from "../handlers/memberAddHandler";
import config from "../config";

describe("Member Add Handler", () => {
    const logChannel = {
        send: jest.fn()
    }

    const mainServerMemberRoles = {
        "1": {
            id: "1",
            name: "role1"
        }
    }

    const mainServerMember = {
        displayName: "Member 1",
        user: {
            id: "1"
        },
        roles: {
            fetch: jest.fn().mockReturnValue(mainServerMemberRoles)
        }

    }

    const mainServer = {
        id: "1",
        name: "Main Server",
        members: {
            fetch: jest.fn().mockReturnValue(mainServerMember)
        },
        channels: {
            fetch: jest.fn().mockReturnValue(logChannel)
        }
    }

    const addedMember = {
        displayName: "Member 1",
        user: {
            id: "1"
        },
        guild: {
            name: "Main Server",
            id: 1
        },
        client: {
            guilds : {
                fetch: jest.fn().mockReturnValue(mainServer)
            }
        },
        roles: {
            add: jest.fn()
        }
    };

    // when a member joins a synced server, but that member is not in the main server
    // no roles should be added to the joining member
    it("if member is not in main server, no roles are added, and logchannel message is sent", async () => {
        memberAddHandler(addedMember);
        expect();
    });

    // when a member joins a synced server, and that member is in the main server
    
    // each role from the main server that shares a name with a role in the 
    // joined server should be added to the joining member
    it("if server id is listed as a synced server, role is added to member, and logchannel message is sent", async () => {
        memberAddHandler(addedMember);
        expect();
    });

    // when a member joins a synced server, and that member is in the main server

    // the bot should not attempt to add role names that do not exist in the synced server 
    // to joining member
    it("does not try to add non-existent named role", async () => {
        memberAddHandler(addedMember);
        expect();
    });

    // when a member joins a synced server, and that member is in the main server
    // the bot should not attempt to add @everyone role to joining member
    it("does not try to add @everyone role", async () => {
        memberAddHandler(addedMember);
        expect();
    });

    // when a member joins a synced server, and that member is in the main server
    // the bot should not attempt to a nitro boosted role to joining member
    it("does not try to add nitro boosted role", async () => {
        memberAddHandler(addedMember);
        expect();
    });

    // when a member joins a synced server, and that member is in the main server
    
    // the bot should not attempt to a role that is higher than the bots in the heirarchy
    // to joining member
    it("does not try to add role that is higher than bots role", async () => {
        memberAddHandler(addedMember);
        expect();
    });
});