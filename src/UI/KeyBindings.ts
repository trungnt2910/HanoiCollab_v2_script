import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";
import { LoginPopup } from "./Login";
import { ServerPrompt } from "./Server";
import { ToggleStealthMode } from "./StealthMode";

const Listeners: IDictionary<Array<(e: KeyboardEvent) => void>> = {};

function SetupKeyBindings()
{
    HanoiCollabGlobals.Document.addEventListener('keyup', function (e)
    {
        if (e.altKey)
        {
            for (var listener of Listeners[e.key] ?? [])
            {
                listener(e);
            }
        }
    }, false);

    AddKeyBinding('h', (e) => ToggleStealthMode());
    AddKeyBinding('s', (e) => ServerPrompt());
    AddKeyBinding('l', (e) => LoginPopup());
}

function AddKeyBinding(key: string, listener: (e: KeyboardEvent) => void)
{
    if (!Listeners[key])
    {
        Listeners[key] = [];
    }
    Listeners[key].push(listener);
}

export { SetupKeyBindings, AddKeyBinding }