import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { GetToken } from "./Login";
import { HanoiCollab$ } from "./HanoiCollabQuery";
import { Html } from "../Utilities/Html";
import { AddKeyBinding } from "./KeyBindings";
import { HanoiCollabConnection } from "../Data/HanoiCollabConnection";

async function SetupChatConnection()
{
    var connection = new HubConnectionBuilder()
        .withUrl(HanoiCollabGlobals.Server + "hubs/chat", { accessTokenFactory: GetToken })
        .build() as HanoiCollabConnection;
    
    await connection.start();

    connection.DeliberateClose = false;

    connection.onclose(function()
    {
        if (connection.DeliberateClose)
        {
            return;
        }
        console.log("Reconnecting to chat channel...");
        var handle = setInterval(async function()
        {
            await connection.start();
            await HanoiCollabGlobals.ChatConnection?.invoke("JoinChannel", HanoiCollabGlobals.Channel);
            clearInterval(handle);
        }, 5000);
    });

    HanoiCollabGlobals.ChatConnection = connection;
    return connection;
}

async function SetupChatUserInterface()
{
    HanoiCollab$("#hanoicollab-chat-container")?.remove();

    HanoiCollab$("body")!.appendChild(Html.createElement(`
    <div id="hanoicollab-chat-container" class="hanoicollab-basic-container" style="position:fixed;right:16px;bottom:16px;height:20%;width:30%;border-radius:1ex;background-color:rgba(0,127,255,0.9);z-index:9997;user-select:text">
        <div id="hanoicollab-chat-messages" style="width:100%;height:80%;overflow:auto;top:0;position:absolute;margin:0;"></div>
        <input type="text" autocomplete="off" id="hanoicollab-chat-input" style="width:100%;bottom:-10%;position:absolute;">
    </div>
    `));

    HanoiCollab$("#hanoicollab-chat-input")?.addEventListener("keyup", async function(e) 
    {
        if (e.key === "Enter") 
        {
            var message = (HanoiCollab$("#hanoicollab-chat-input") as HTMLInputElement).value;
            // Prevent empty message spam.
            if (message)
            {
                (HanoiCollab$("#hanoicollab-chat-input") as HTMLInputElement).value = "";
                await HanoiCollabGlobals.ChatConnection?.invoke("SendMessage", HanoiCollabGlobals.Channel, message);
                e.preventDefault();    
            }
        }
    });

    HanoiCollabGlobals.ChatConnection?.on("ReceiveMessage", function(name: string, message: string)
    {
        HanoiCollab$("#hanoicollab-chat-messages")?.appendChild(Html.createElement(`<p class="hanoicollab-basic-container" style="user-select:text;word-wrap: break-word;"><b>${name.escapeHTML()}</b>: ${message.escapeHTML()}</p>`));
        HanoiCollab$("#hanoicollab-chat-messages")!.scrollTop = HanoiCollab$("#hanoicollab-chat-messages")!.scrollHeight;
    })

    await HanoiCollabGlobals.ChatConnection?.invoke("JoinChannel", HanoiCollabGlobals.Channel);

    AddKeyBinding('c', function()
    {
        var container = HanoiCollab$("#hanoicollab-chat-container");
        if (!container)
        {
            return;
        }
        if (container.style.display == "none")
        {
            container.style.display = "";
        }
        else
        {
            container.style.display = "none";
        }
    });    
}

async function TerminateChatConnection()
{
    if (HanoiCollabGlobals.ChatConnection)
    {
        await HanoiCollabGlobals.ChatConnection.invoke("LeaveChannel", HanoiCollabGlobals.Channel);
        HanoiCollabGlobals.ChatConnection.DeliberateClose = true;
        await HanoiCollabGlobals.ChatConnection.stop();
        HanoiCollabGlobals.ChatConnection = null;
    }
}

export { SetupChatConnection, SetupChatUserInterface, TerminateChatConnection };