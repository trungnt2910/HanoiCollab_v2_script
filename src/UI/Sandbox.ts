import { PatchElement } from "../Patching/PatchElement";
import { PatchLocation } from "../Patching/PatchLocation";
import { PatchScript } from "../Patching/PatchScript";
import { Download } from "../Utilities/Download";
import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";
import { Html } from "../Utilities/Html";

async function SetupSandbox() : Promise<{Window: Window, Document: Document}>
{
    if (HanoiCollabGlobals.ProviderFunctions.DisableSandbox())
    {
        HanoiCollabGlobals.Window = unsafeWindow;
        HanoiCollabGlobals.Document = document;
        return Promise.resolve({Window: HanoiCollabGlobals.Window, Document: HanoiCollabGlobals.Document});
    }

    var style = Html.createElement(`
    <style>
        body {
            margin: 0;
            overflow: hidden;
        }
        #iframe1 {
            position:absolute;
            left: 0px;
            width: 100%;
            top: 0px;
            height: 100%;
        }
    </style>
    `);
    window.document.body.textContent = "";
    window.document.body.appendChild(style);
    var frame = window.document.createElement("iframe");
    frame.id = "iframe1";
    window.document.body.appendChild(frame);
    var request = await Download(location.href);
    var parser = new DOMParser();
    var htmlDoc = parser.parseFromString(request.responseText, 'text/html');

    for (var base of htmlDoc.getElementsByTagName("base"))
    {
        base.href = location.origin + "/";
    }

    for (var elem of htmlDoc.documentElement.getElementsByTagName("*"))
    {
        PatchLocation(elem);
        await PatchScript(elem);
        PatchElement(elem);
    }

    var blob = new Blob([htmlDoc.documentElement.outerHTML], {type: "text/html"});

    return await new Promise(function (resolve, reject)
    {
        frame.onload = function()
        {
            new MutationObserver(async function(mutations)
            {
                for (var mutation of mutations)
                {
                    for (var node of mutation.addedNodes)
                    {
                        if (("getAttribute" in node) && ("getElementsByTagName" in node)) 
                        {
                            var elem = node as Element;
                            PatchLocation(elem);
                            await PatchScript(elem);
                            for (var childElem of elem.getElementsByTagName("*"))
                            {
                                PatchLocation(childElem);
                                await PatchScript(childElem);
                            }    
                        }
                    }
                }
            }).observe(frame.contentDocument!.documentElement, {childList: true, subtree: true});
            HanoiCollabGlobals.Document = frame.contentDocument!;
            HanoiCollabGlobals.Window = frame.contentWindow!;
            resolve({Document: frame.contentDocument!, Window: frame.contentWindow!});
        }
        frame.src = URL.createObjectURL(blob);
    });
}

export { SetupSandbox };