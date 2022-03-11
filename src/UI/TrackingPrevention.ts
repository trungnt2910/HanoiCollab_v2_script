import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";
import { DisplayPopup } from "./DisplayPopup";

function SetupTrackingPrevention()
{
    HanoiCollabGlobals.Window.HanoiCollabExposedVariables = HanoiCollabGlobals.Window.HanoiCollabExposedVariables || []; 
    HanoiCollabGlobals.Window.HanoiCollabExposedVariables.HanoiCollabApproveRequest = async function(data: any)
    {
        switch (HanoiCollabGlobals.Provider)
        {
            case "quilgo.com":
            {
                if (data.path == "snapshots" || data.path == "screenshots")
                {
                    if (HanoiCollabGlobals.AlwaysBlockImage && HanoiCollabGlobals.AlwaysBlockImage[data.path])
                    {
                        throw "Image blocked by HanoiCollab";
                    }
                    if (HanoiCollabGlobals.AlwaysSendImage && HanoiCollabGlobals.AlwaysSendImage[data.path])
                    {
                        return;
                    }
                    if (HanoiCollabGlobals.LoopImage && HanoiCollabGlobals.LoopImage[data.path])
                    {
                        console.log("HanoiCollab is looping an old image for " + data.path);
                        data.payload.image = HanoiCollabGlobals.LoopImage[data.path];
                        var collectorType = "";
                        switch (data.path)
                        {
                            case "snapshots":
                                collectorType = "camera";
                                break;
                            case "screenshots":
                                collectorType = "screen";
                                break;
                        }
                        HanoiCollabGlobals.AlwaysBlockImage = HanoiCollabGlobals.AlwaysBlockImage || {};
                        HanoiCollabGlobals.AlwaysBlockImage[data.path] = true;
                        console.log("HanoiCollab is restoring original interval....");
                        setTimeout(function()
                        {
                            HanoiCollabGlobals.AlwaysBlockImage = HanoiCollabGlobals.AlwaysBlockImage || {};
                            HanoiCollabGlobals.AlwaysBlockImage[data.path] = false;
                        }, HanoiCollabGlobals.Window.HanoiCollabExposedVariables.OldIntervals[collectorType]);
                        return;
                    }

                    var parser = new DOMParser();
                    var doc = parser.parseFromString(
                        `
                        <p>Quilgo's PLASM engine is trying to record your ${data.path == "snapshots" ? "snapshot" : "screenshot"}! Choose your action!</p>
                        <div style="display:flex;justify-content:center;align-items:center;width:100%;">
                            <img src="data:image/jpeg;base64,${data.payload.image}" style="max-width:100%;"></img>
                        </div>
                        <button class="hanoicollab-button" value="loop">Send this image over and over</button>
                        <button class="hanoicollab-button" value="send">Send</button>
                        <button class="hanoicollab-button" value="always-send">Always send ${data.path}</button>
                        <button class="hanoicollab-button" value="block">Block</button>
                        <button class="hanoicollab-button" value="always-block">Always block ${data.path}</button>
                        `
                    , "text/html").body;
                    var result = await DisplayPopup(doc, true);
                    switch (result)
                    {
                        case "loop":
                            var image = data.payload.image;
                            HanoiCollabGlobals.LoopImage = HanoiCollabGlobals.LoopImage || {};
                            HanoiCollabGlobals.LoopImage[data.path] = image;
                            return;
                        case "send":
                            return;
                        case "always-send":
                            HanoiCollabGlobals.AlwaysSendImage = HanoiCollabGlobals.AlwaysSendImage || {};
                            HanoiCollabGlobals.AlwaysSendImage[data.path] = true;
                            return;
                        case "block":
                            throw "Image blocked by HanoiCollab";
                        case "always-block":
                            HanoiCollabGlobals.AlwaysBlockImage = HanoiCollabGlobals.AlwaysBlockImage || {};
                            HanoiCollabGlobals.AlwaysBlockImage[data.path] = true;
                            throw "Image blocked by HanoiCollab";
                    }
                }
                return;
            }
        }
    }
}

export { SetupTrackingPrevention };