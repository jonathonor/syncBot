import { interactionHandler } from "../handlers/interactionHandler";

describe("Interaction Handler", () => {
    const interaction = {
        type: 1
    };

    it("should do nothing if type is not 2", async () => {
        interactionHandler(interaction);
        expect()
    });

    it("should respond to interaction with error if interaction is not from a guild", async () => {
        interactionHandler(interaction);
        expect()
    });

    it("should respond to interaction with error if member is not guild owner", async () => {
        interactionHandler(interaction);
        expect()
    });

    it("should respond to interaction with error if member does not have allowed role id", async () => {
        interactionHandler(interaction);
        expect()
    });

    it("should respond to interaction with error if member does not have allowed role name", async () => {
        interactionHandler(interaction);
        expect()
    });

    describe("Add", () => {
        it("should add role to user in main server", async () => {
            interactionHandler(interaction);
            expect()
        });
        
        it("if one synced server, should respond to interaction with message saying role was added in the single synced server", async () => {
            interactionHandler(interaction);
            expect()
        });

        it("if more than one synced server, should respond to interaction with check log channel message", async () => {
            interactionHandler(interaction);
            expect()
        });

        it("if more than one synced server and logChannelId in config, should log each server role add in logchannel", async () => {
            interactionHandler(interaction);
            expect()
        });

        it("if more than one synced server and logChannelId NOT in config, should console log each server role add", async () => {
            interactionHandler(interaction);
            expect()
        });

        it("should add role to user in each synced server they are in", async () => {
            interactionHandler(interaction);
            expect()
        });

        it("if role does not exist in a synced server, should respond to interaction with helpful message", async () => {
            interactionHandler(interaction);
            expect()
        });

        it("if member does not exist in a synced server, should respond to interaction with helpful message", async () => {
            interactionHandler(interaction);
            expect()
        });
    });

    describe("Remove", () => {
        it("should remove role to user in main server", async () => {
            interactionHandler(interaction);
            expect()
        });
        
        it("if one synced server, should respond to interaction with message saying role was removed in the single synced server", async () => {
            interactionHandler(interaction);
            expect()
        });

        it("if more than one synced server, should respond to interaction with check log channel message", async () => {
            interactionHandler(interaction);
            expect()
        });

        it("if more than one synced server and logChannelId in config, should log each server role remove in logchannel", async () => {
            interactionHandler(interaction);
            expect()
        });

        it("if more than one synced server and logChannelId NOT in config, should console log each server role removal", async () => {
            interactionHandler(interaction);
            expect()
        });

        it("should remove role to user in each synced server they are in", async () => {
            interactionHandler(interaction);
            expect()
        });

        it("if role does not exist in a synced server, should respond to interaction with helpful message", async () => {
            interactionHandler(interaction);
            expect()
        });

        it("if member does not exist in a synced server, should respond to interaction with helpful message", async () => {
            interactionHandler(interaction);
            expect()
        });
    });
});