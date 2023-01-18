import { memberUpdateHandler } from "../handlers/memberUpdateHandler";

describe("Member Update Handler", () => {
    const originalMember = {
    };

    const updatedMember = {
    };

    it("if role is added to user in main server, role is added in each synced server", async () => {
        memberUpdateHandler(originalMember, updatedMember);
        expect();
    });

    it("if role is removed from user in main server, role is removed in each synced server", async () => {
        memberUpdateHandler(originalMember, updatedMember);
        expect();
    });
});