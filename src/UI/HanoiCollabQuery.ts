import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";

function HanoiCollab$(selector: string | HTMLElement): HTMLElement | null
{
    if (typeof selector === "string")
    {
        return HanoiCollabGlobals.Document.querySelector(selector);
    }
    return selector;
}

export { HanoiCollab$ };