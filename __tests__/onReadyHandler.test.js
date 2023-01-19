import { onReadyHandler } from "../handlers/onReadyHandler";
import { globals } from "../globals.js";
import { Collection } from "discord.js";

describe("On Ready Handler", () => {
    const logChannel = {
        send: jest.fn(() => Promise.resolve())
    }

    const guild = {
        channels: {
            fetch: jest.fn(() => Promise.resolve(logChannel))
        },
        members: {
            fetch: jest.fn(() => Promise.resolve())
        }
    }
    
    const guilds = new Map();
    guilds.set('1', guild);
    
    globals.client = {
        guilds: {
            fetch: jest.fn(() => Promise.resolve(new Collection(guilds.entries())))
        }
    }
    it("kills the process if bot is not in main server", async () => {
        const mockExit = jest.spyOn(process, 'exit').mockImplementation((number) => { throw new Error('process.exit: ' + number); });
        await onReadyHandler();
        
        expect(mockExit).toHaveBeenCalledWith(1);
        mockExit.mockRestore();
    });
});