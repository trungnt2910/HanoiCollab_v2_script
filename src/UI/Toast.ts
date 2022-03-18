import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";
import { Download } from "../Utilities/Download";
import { Html } from "../Utilities/Html";

import "../Utilities/String";

enum ToastType
{
    Info,
    Success,
    Warning,
    Error
};

class ToastAction
{
    Text: string = "";
    Function: () => void = () => {};
}

async function SetupToast()
{
    var css = (await Download("https://raw.githubusercontent.com/mickelsonmichael/js-snackbar/master/dist/js-snackbar.css")).responseText
        .replace(new RegExp("js-snackbar".escapeRegex(), "g"), "hanoicollab-js-snackbar");

    HanoiCollabGlobals.Document.body.appendChild(Html.createElement(`
        <style>${css}</style>
    `));

    var code = (await Download("https://raw.githubusercontent.com/mickelsonmichael/js-snackbar/master/dist/js-snackbar.js")).responseText
        .replace(new RegExp("js-snackbar".escapeRegex(), "g"), "hanoicollab-js-snackbar");

    HanoiCollabGlobals.Window.eval(code);
}

function DisplayToast(type: ToastType, content: string | HTMLElement, timeout: number = 5000, actions: Array<ToastAction> = [])
{
    // Respect Stealth Mode.
    if (HanoiCollabGlobals.IsStealthMode)
    {
        return;
    }

    var stringType = "";
    switch (type)
    {
        case ToastType.Info:
            stringType = "info";
            break;
        case ToastType.Success:
            stringType = "success";
            break;
        case ToastType.Warning:
            stringType = "warning";
            break;
        case ToastType.Error:
            stringType = "error";
            break;
    }

    var message = undefined;
    var element = undefined;

    if (typeof content === "string")
    {
        message = content;
    }
    else
    {
        element = content;
    }

    HanoiCollabGlobals.Window.SnackBar({
        message: message,
        status: stringType,
        dismissible: true,
        timeout: timeout,
        actions: actions.map(action => {return {"text": action.Text, "function": action.Function, "dismiss": true}}),
        fixed: true,
        position: "tr",
        container: HanoiCollabGlobals.Document.body,
    });
}

export { ToastType, ToastAction, SetupToast, DisplayToast };