import { memberAddHandler } from "../handlers/memberAddHandler";

describe("Member Add Handler", () => {
    const addedMember = {
    };

    it("if server id is listed as a synced server, role is added to member, and logchannel message is sent", async () => {
        memberAddHandler(addedMember);
        expect()
    });

    it("if member is not in main server, no roles are added, and logchannel message is sent", async () => {
        memberAddHandler(addedMember);
        expect()
    });

    it("does not try to add @everyone role", async () => {
        memberAddHandler(addedMember);
        expect()
    });

    it("does not try to add nitro boosted role", async () => {
        memberAddHandler(addedMember);
        expect()
    });

    it("does not try to add role that is higher than bots role", async () => {
        memberAddHandler(addedMember);
        expect()
    });
});