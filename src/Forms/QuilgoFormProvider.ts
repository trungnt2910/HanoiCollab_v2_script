import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";
import { FormProvider } from "./FormProvider";
import { FormProviderType } from "./FormProviderType";

class QuilgoFormProvider extends FormProvider
{
    PatchScript(src: string, code: string): string
    {
        if (src.includes("collector.min"))
        {
            code = code
                // PLASM: Block focus tracking
                .replace(`this.checkAndHandleUnfocused=()=>{`, `this.checkAndHandleUnfocused=()=>{console.log("Blocked monitor action.");return;`)
                // PLASM: Allow sharing one tab
                .replace(/getSelectedArea\([A-Za-z,]*?\){/g, match => match + `return "monitor";`);

            if (HanoiCollabGlobals.EnableTrackingPrevention)
            {
                code = code .replace(/(new Promise\(\()(\(.,.\))/, "$1 async $2")
                            // Here, we hardcode the interval to 5000 to allow students to have more time preparing their screens.
                            .replace(/validateOptions\(t\){/g, "validateOptions(t){if (t.interval) {window.HanoiCollabExposedVariables = window.HanoiCollabExposedVariables || []; window.HanoiCollabExposedVariables.OldIntervals = window.HanoiCollabExposedVariables.OldIntervals || {}; window.HanoiCollabExposedVariables.OldIntervals[t.id] = t.interval; t.interval = 5000;}")
                            .replace(/JSON\.stringify\(([^\)]*?)\.payload\)/, `(await (async function(t){if(!window.HanoiCollabExposedVariables?.HanoiCollabApproveRequest){throw "HanoiCollab blocked";} await window.HanoiCollabExposedVariables.HanoiCollabApproveRequest(t); return JSON.stringify(t.payload);})($1))`)
            }
        }
        if (src.includes("link.js") || src.includes("app.js") || src.includes("form.js"))
        {
            code = code .replace(/\/api/g, window.location.origin + "/api")
                        .replace(/\/stream/g, window.location.origin + "/stream");
        }
        return code;
    }

    PatchElement(element: Element): void 
    {
        if (element.classList.contains("form-submitted"))
        {
            element.remove();
        }
        if (element.classList.contains("plasm-caliber"))
        {
            var parser = new DOMParser();
            var doc = parser.parseFromString(
                `
                <div class="hanoicollab-basic-container" style="color:red;">
                    <b>This is a screen-monitored exam! Please remember to enable Stealth Mode (by pressing Alt + H) before proceeding.</b>
                    </br>
                    <b>Furthermore, to prevent HanoiCollab's sign in popup to appear during the test, if you haven't logged in for more than 20 hours, please renew your 
                    session by pressing Alt + L and entering your username and password in the dialog box.</b>
                    <h4>Good luck, and have fun!</h4>
                </div>
                `
            , "text/html").body.firstChild;
            element.appendChild(doc as ChildNode);
        }
    }

    GetType(): FormProviderType
    {
        return FormProviderType.Quilgo;
    }

    DisableSandbox(): boolean 
    {
        // There's some _urrh_ Google Captcha bullshit on this page.
        // We also want to steer clear of it.
        if (document.querySelector("[class='auth-via-email-submit']"))
        {
            return true;
        }
        return false;
    }

    ChildProviders(): FormProviderType[] 
    {
        return [FormProviderType.GoogleDocs];  
    }
}

export { QuilgoFormProvider };