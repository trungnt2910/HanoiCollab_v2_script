import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";
import { Html } from "../Utilities/Html";
import { HanoiCollab$ } from "./HanoiCollabQuery";

function AppendStealthModeStyle()
{
    var stealthModeStyle = Html.createElement(`
    <style>
        *[id^="hanoicollab-"], *[class^="hanoicollab-"] {
            display:                  none;
        }
    </style>
    `);
    stealthModeStyle.id = "hanoicollab-stealth-mode-css";
    HanoiCollabGlobals.Document.body.appendChild(stealthModeStyle);
}

function RemoveStealthModeStyle()
{
    HanoiCollab$("#hanoicollab-stealth-mode-css")?.remove();
}

function ToggleStealthMode()
{
    HanoiCollabGlobals.IsStealthMode = !HanoiCollabGlobals.IsStealthMode;
    SetupStealthMode(true);
}

function SynchronizeStealthMode(originId: string | null = null)
{
    originId = originId || HanoiCollabGlobals.WindowId;
    // Stealth mode synchronization
    if (window.parent)
    {
        window.parent.postMessage({
            Type: "HanoiCollabStealthMode",
            Value: HanoiCollabGlobals.IsStealthMode,
            OriginId: originId
        }, "*");
    }
    for (var frame of document.querySelectorAll("iframe"))
    {
        frame.contentWindow?.postMessage({
            Type: "HanoiCollabStealthMode",
            Value: HanoiCollabGlobals.IsStealthMode,
            OriginId: originId
        }, "*");
    }
}

window.addEventListener("message", function(event)
{
    var msg = event.data;
    if (msg.Type === "HanoiCollabStealthMode")
    {
        if (msg.OriginId == HanoiCollabGlobals.WindowId)
        {
            return;
        }
        console.log(window.location.href + ": Received stealth mode message: " + msg.Value + " from " + msg.OriginId);
        HanoiCollabGlobals.IsStealthMode = msg.Value;
        SetupStealthMode(true);
        SynchronizeStealthMode(msg.OriginId);
    }
});

async function SetupStealthMode(init = false)
{
    if (!init)
    {
        var stealthModeConfig = JSON.parse(await GM_getValue("HanoiCollabStealthConfig", "{}"));
        if (stealthModeConfig[HanoiCollabGlobals.Provider])
        {
            HanoiCollabGlobals.IsStealthMode = stealthModeConfig[HanoiCollabGlobals.Provider];
        }
        HanoiCollabGlobals.StealthModeConfig = stealthModeConfig;
    }
    // Probably a hosted iframe where HanoiCollab is disabled.
    if (!HanoiCollabGlobals.Document)
    {
        return;
    }
    if (HanoiCollabGlobals.IsStealthMode)
    {
        AppendStealthModeStyle();
        HanoiCollabGlobals.StealthModeConfig[HanoiCollabGlobals.Provider] = true;
    }
    else
    {
        RemoveStealthModeStyle();
        HanoiCollabGlobals.StealthModeConfig[HanoiCollabGlobals.Provider] = false;
    }
    // Sync with children
    for (var child of (HanoiCollabGlobals.ProviderFunctions.ChildProviders() || []))
    {
        HanoiCollabGlobals.StealthModeConfig[child] = HanoiCollabGlobals.IsStealthMode;
    }
    SynchronizeStealthMode();
    await GM_setValue("HanoiCollabStealthConfig", JSON.stringify(HanoiCollabGlobals.StealthModeConfig));
}

export { SetupStealthMode, ToggleStealthMode }