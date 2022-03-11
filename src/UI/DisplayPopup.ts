import { Html } from "../Utilities/Html";
import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";
import { HanoiCollab$ } from "./HanoiCollabQuery";
import { ToggleStealthMode } from "./StealthMode";

async function DisplayPopup(element: Element, urgent: boolean = false)
{
    while (HanoiCollabGlobals.NoticePopupPromise)
    {
        await HanoiCollabGlobals.NoticePopupPromise;
    }

    HanoiCollabGlobals.NoticePopupPromise = new Promise(async function(resolve, reject)
    {
        var needsReToggle = false;

        if (urgent && HanoiCollabGlobals.IsStealthMode)
        {
            needsReToggle = true;
            ToggleStealthMode();
        }

        HanoiCollab$(HanoiCollabGlobals.Document.body)!.appendChild(Html.createElement(`
        <div id="hanoicollab-notice-popup-container" class="hanoicollab-basic-container">
            <p id="hanoicollab-notice-popup-background" style="position:fixed;top:0;left:0;right:0;bottom:0;background-color:rgba(0,0,0,0.9);z-index:9998;"></p>      
            <div id="hanoicollab-notice-popup" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:50%;padding:2em;color:white;background-color:rgba(0,127,255,0.75);border-radius:1ex;z-index:9999;">
            ${element.outerHTML}
            </div>
        </div>
        `));

        for (let button of HanoiCollabGlobals.Document.getElementById("hanoicollab-notice-popup")?.getElementsByTagName("button") ?? [])
        {
            button.onclick = function()
            {
                if (needsReToggle)
                {
                    ToggleStealthMode();
                }
                HanoiCollab$("#hanoicollab-notice-popup-container")?.remove();
                HanoiCollabGlobals.NoticePopupPromise = null;
                resolve(button.value);
            }
        }
    });

    return await HanoiCollabGlobals.NoticePopupPromise;
}

export { DisplayPopup };