import { onReadyHandler } from "../handlers/onReadyHandler";

describe("On Ready Handler", () => {
    it("kills the process if bot is not in main server", async () => {
        onReadyHandler(interaction);
        expect();
    });
});