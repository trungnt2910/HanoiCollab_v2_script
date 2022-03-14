import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";

async function ServerPrompt()
{
    var server = prompt("Enter your HanoiCollab server address", (HanoiCollabGlobals.Server != "") ? HanoiCollabGlobals.Server : "https://hanoicollab.herokuapp.com/")!;
    if (!server.endsWith("/"))
    {
        server += "/";
    }
    await GM_setValue("HanoiCollabServer", server);
    HanoiCollabGlobals.Server = server;
    return server;
}

async function SetupServer()
{
    var storedServer = await GM_getValue("HanoiCollabServer", null);
    if (!storedServer)
    {
        storedServer = ServerPrompt();
    }
    HanoiCollabGlobals.Server = storedServer;
    return storedServer;
}

export { ServerPrompt, SetupServer }