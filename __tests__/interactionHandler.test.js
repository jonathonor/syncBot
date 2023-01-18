import { interactionHandler } from "../handlers/interactionHandler";
import guilds from "../__fixtures__/guilds.json";

describe("Interaction Handler", () => {
    const interaction = {
        type: 1
    };

    // if the interation type is not an application command, then the bot should ignore it
    it("should do nothing if type is not 2", async () => {
        interactionHandler(interaction);
        expect();
    });

    // if the interaction was sent from a DM or anywhere not in a guild, the bot should reply with 
    // a helpful message to the user
    it("should respond to interaction with error if interaction is not from a guild", async () => {
        interactionHandler(interaction);
        expect();
    });

    // if the interaction was sent from a guild not set as mainserver, the bot should reply with 
    // a helpful message to the user
    it("should respond to interaction with error if interaction is not from a guild", async () => {
        interactionHandler(interaction);
        expect();
    });

    // if the interaction was sent by a member that is not the owner of the guild and the bot config
    // does not list an approved role name, the bot should reply with a helpful error
    it("should respond to interaction with error if member is not guild owner", async () => {
        interactionHandler(interaction);
        expect();
    });

    // if the interaction was sent by a member that is not the owner of the guild and the bot config
    // has an approved role name listed, the bot should reply with a helpful error
    it("should respond to interaction with error if member does not have allowed role name", async () => {
        interactionHandler(interaction);
        expect();
    });

    describe("Add", () => {
        // should add the selected role to the selected user in the main server
        it("should add role to user in main server", async () => {
            interactionHandler(interaction);
            expect();
        });
        
        // if there is only one synced server, and selected user is in synced server
        // should respond to interaction with message noting role was added for user in synced server
        it("if one synced server, should respond to interaction with message saying role was added in the single synced server", async () => {
            interactionHandler(interaction);
            expect();
        });

        // if there is only one synced server, and selected user is NOT in synced server
        // should respond to interaction with message noting role was NOT added for user in synced server
        it("if one synced server, should respond to interaction with message saying role was added in the single synced server", async () => {
            interactionHandler(interaction);
            expect();
        });

        it("if more than one synced server, should respond to interaction with check log channel message", async () => {
            interactionHandler(interaction);
            expect();
        });

        it("if more than one synced server and logChannelId in config, should log each server role add in logchannel", async () => {
            interactionHandler(interaction);
            expect();
        });

        it("if more than one synced server and logChannelId NOT in config, should console log each server role add", async () => {
            interactionHandler(interaction);
            expect();
        });

        it("should add role to user in each synced server they are in", async () => {
            interactionHandler(interaction);
            expect();
        });

        it("if role does not exist in a synced server, should respond to interaction with helpful message", async () => {
            interactionHandler(interaction);
            expect();
        });

        it("if member does not exist in a synced server, should respond to interaction with helpful message", async () => {
            interactionHandler(interaction);
            expect();
        });
    });

    describe("Remove", () => {
        it("should remove role to user in main server", async () => {
            interactionHandler(interaction);
            expect();
        });
        
        it("if one synced server, should respond to interaction with message saying role was removed in the single synced server", async () => {
            interactionHandler(interaction);
            expect();
        });

        it("if more than one synced server, should respond to interaction with check log channel message", async () => {
            interactionHandler(interaction);
            expect();
        });

        it("if more than one synced server and logChannelId in config, should log each server role remove in logchannel", async () => {
            interactionHandler(interaction);
            expect();
        });

        it("if more than one synced server and logChannelId NOT in config, should console log each server role removal", async () => {
            interactionHandler(interaction);
            expect();
        });

        it("should remove role to user in each synced server they are in", async () => {
            interactionHandler(interaction);
            expect();
        });

        it("if role does not exist in a synced server, should respond to interaction with helpful message", async () => {
            interactionHandler(interaction);
            expect();
        });

        it("if member does not exist in a synced server, should respond to interaction with helpful message", async () => {
            interactionHandler(interaction);
            expect();;
        });
    });
});