import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";
import { Download } from "../Utilities/Download";

function PatchWindowAccess(code: string) : string
{
    return code
        .replace(/window\.location/g, "window.parent.location")
        .replace(/window\.history/g, "window.parent.history")
        .replace(/document\.location\.href/g, "window.parent.document.location.href")
        .replace(/window\.parent\.location\.href=([^=])/g, function(match: string) : string
        {
            var index = match.indexOf("=");
            return match.slice(0, index + 1) + "window.parent.document.location.origin+" + match.slice(index + 1);
        });
}

async function PatchScript(script : Element)
{
    if (!script || script.tagName !== "SCRIPT")
    {
        return;
    }

    var scriptSource = script.getAttribute("src");
    if (scriptSource)
    {
        var request = await Download(scriptSource);
        var scriptContent = HanoiCollabGlobals.ProviderFunctions.PatchScript(scriptSource, PatchWindowAccess(request.responseText));
        var scriptBlob = new Blob([scriptContent], {type: "application/javascript"});
        script.setAttribute("src", URL.createObjectURL(scriptBlob));
        script.setAttribute("originalSrc", scriptSource);
    }

    if (script.textContent)
    {
        script.textContent = PatchWindowAccess(script.textContent);
    }

    script.removeAttribute("integrity");
}

export { PatchScript };
