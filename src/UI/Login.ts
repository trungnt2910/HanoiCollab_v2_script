import { Html } from "../Utilities/Html";
import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";
import { HanoiCollab$ } from "./HanoiCollabQuery";

async function LoginPopup(displayText: string | null = null)
{
    if (HanoiCollabGlobals.Document.getElementById("hanoicollab-login-popup-container"))
    {
        return await HanoiCollabGlobals.LoginPopupPromise;
    }

    HanoiCollabGlobals.LoginPopupPromise = new Promise(async function(resolve, reject)
    {
        var oldUsername = await GM_getValue("HanoiCollabUsername", "");

        displayText = displayText ? displayText : "Please sign in to use HanoiCollab";

        //--- Use jQuery to add the form in a "popup" dialog.
        HanoiCollab$(HanoiCollabGlobals.Document.body)!.appendChild(Html.createElement(`
        <div id="hanoicollab-login-popup-container" class="hanoicollab-basic-container">
            <p id="hanoicollab-login-popup-background" style="position:fixed;top:0;left:0;right:0;bottom:0;background-color:rgba(0,0,0,0.9);z-index:9998;"></p>      
            <div id="hanoicollab-login-popup" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:50%;padding:2em;color:white;background-color:rgba(0,127,255,0.75);border-radius:1ex;z-index:9999;">
                <p class="hanoicollab-basic-container">${displayText}</p>
                
                <div class="hanoicollab-section">
                    <p class="hanoicollab-basic-container">Your current HanoiCollab server: <a class="hanoicollab-basic-container" href="${HanoiCollabGlobals.Server}" style="color:orange;">${HanoiCollabGlobals.Server}</a>.</p>
                    <p class="hanoicollab-basic-container">Press Alt+S to change your server.</p>
                </div>

                <div class="hanoicollab-section">
                    <input class="hanoicollab-basic-container" type="text" id="hanoicollab-username" style="color:black;" value="${oldUsername}">                           
                    <input class="hanoicollab-basic-container" type="password" id="hanoicollab-password" style="color:black;" value="">
                <div>

                <p class="hanoicollab-basic-container" id="hanoicollab-login-status">Please enter your HanoiCollab username and password.</p>

                <div class="hanoicollab-section">
                    <button class="hanoicollab-button" id="hanoicollab-login-button">Login</button>
                    <button class="hanoicollab-button" id="hanoicollab-register-button">Register</button>
                    <button class="hanoicollab-button" id="hanoicollab-close-button">Later</button>
                    <button class="hanoicollab-button" id="hanoicollab-close-suppress-button">Don't bother me today</button>
                </div>
            </div>
        </div>                                                                    
        `));

        function EnableFields()
        {
            HanoiCollab$("#hanoicollab-username")?.removeAttribute("disabled");
            HanoiCollab$("#hanoicollab-password")?.removeAttribute("disabled");
        }

        function DisableFields()
        {
            HanoiCollab$("#hanoicollab-username")?.setAttribute("disabled", "");
            HanoiCollab$("#hanoicollab-password")?.setAttribute("disabled", "");
        }

        HanoiCollab$("#hanoicollab-login-button")?.addEventListener("click", function()
        {
            var username = (HanoiCollab$("#hanoicollab-username") as HTMLInputElement).value;
            var password = (HanoiCollab$("#hanoicollab-password") as HTMLInputElement).value;

            (HanoiCollab$("#hanoicollab-login-status") as HTMLParagraphElement).innerText = "Logging in...";
            DisableFields();

            GM_xmlhttpRequest({
                method: "POST",
                url: HanoiCollabGlobals.Server + "api/Accounts/login",
                data: JSON.stringify({
                    Name: username,
                    Password: password
                }),
                headers: {
                    "Content-Type": "application/json"
                },
                onload: function(response) 
                {
                    if (response.status === 200)
                    {
                        var data = JSON.parse(response.responseText);
                        if (data.Token)
                        {
                            GM_setValue("HanoiCollabUsername", username);
                            GM_setValue("HanoiCollabIdentity", JSON.stringify(data));
                            HanoiCollab$("#hanoicollab-login-popup-container")?.remove();
                            HanoiCollabGlobals.Identity = data as IIdentity;
                            HanoiCollabGlobals.ActiveUsername = username;
                            if (HanoiCollabGlobals.OnIdentityChange)
                            {
                                HanoiCollabGlobals.OnIdentityChange(HanoiCollabGlobals.Identity);
                            }
                            resolve(data);
                        }
                        else
                        {
                            (HanoiCollab$("#hanoicollab-login-status") as HTMLParagraphElement).innerText = "Error: Invalid response from server.";
                            EnableFields();
                        }    
                    }
                    else
                    {
                        (HanoiCollab$("#hanoicollab-login-status") as HTMLParagraphElement).innerText = "Error: " + response.statusText;
                        EnableFields();
                    }
                },
                onerror: function(response) 
                {
                    (HanoiCollab$("#hanoicollab-login-status") as HTMLParagraphElement).innerText = "Error: " + response.statusText;
                    EnableFields();
                }    
            });
        });

        HanoiCollab$("#hanoicollab-register-button")!.addEventListener("click", function()
        {
            var username = (HanoiCollab$("#hanoicollab-username") as HTMLInputElement).value;
            var password = (HanoiCollab$("#hanoicollab-password") as HTMLInputElement).value;

            (HanoiCollab$("#hanoicollab-login-status") as HTMLParagraphElement).innerText = "Registering...";
            DisableFields();

            GM_xmlhttpRequest({
                method: "POST",
                url: HanoiCollabGlobals.Server + "api/Accounts/register",
                data: JSON.stringify({
                    Name: username,
                    Password: password
                }),
                headers: {
                    "Content-Type": "application/json"
                },
                onload: function(response) {
                    var data = JSON.parse(response.responseText);
                    (HanoiCollab$("#hanoicollab-login-status") as HTMLParagraphElement).innerText = `${data.Status}: ${data.Message}`;
                    EnableFields();
                },
                onerror: function(response) {
                    (HanoiCollab$("#hanoicollab-login-status") as HTMLParagraphElement).innerText = "Error: " + response.statusText;
                }
            });
        });

        
        HanoiCollab$("#hanoicollab-close-button")!.addEventListener("click", function()
        {
            HanoiCollab$("#hanoicollab-login-popup-container")!.remove();
            reject("User cancelled");
        });

        HanoiCollab$("#hanoicollab-close-suppress-button")!.addEventListener("click", function()
        {
            HanoiCollab$("#hanoicollab-login-popup-container")!.remove();
            reject("User cancelled");
        });
    });

    return await HanoiCollabGlobals.LoginPopupPromise;
}

async function SetupIdentity()
{
    var storedIdentity = JSON.parse(await GM_getValue("HanoiCollabIdentity", null));
    if (!storedIdentity || !storedIdentity.Token || !storedIdentity.Expiration || Date.parse(storedIdentity.Expiration) <= Date.now())
    {
        return await LoginPopup();
    }
    var storedUsername = await GM_getValue("HanoiCollabUsername", null);
    HanoiCollabGlobals.Identity = storedIdentity;
    HanoiCollabGlobals.ActiveUsername = storedUsername;
    return HanoiCollabGlobals.Identity;
}

async function GetToken()
{
    var identity = HanoiCollabGlobals.Identity;
    if (!identity)
    {
        identity = await LoginPopup();
    }
    if (Date.parse(identity!.Expiration) <= Date.now())
    {
        await LoginPopup("Session expired. Please sign in to continue using HanoiCollab.");
    }
    return identity!.Token;
}

export { LoginPopup, SetupIdentity, GetToken };