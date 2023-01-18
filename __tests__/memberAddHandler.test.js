import { memberAddHandler } from "../handlers/memberAddHandler";

describe("Member Add Handler", () => {
    const addedMember = {
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