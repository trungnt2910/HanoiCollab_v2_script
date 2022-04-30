import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";
import { Html } from "../Utilities/Html";
import { DisplayPopup } from "./DisplayPopup";
import { AddKeyBinding } from "./KeyBindings";
import { GetImageResource } from "./Resources";

let IsAboutDisplayed = false;

function SetupAbout()
{
    AddKeyBinding('a', DisplayAbout);
}

async function DisplayAbout()
{
    if (IsAboutDisplayed)
    {
        return;
    }
    IsAboutDisplayed = true;
    await DisplayPopup(Html.createElement
    (`
    <div style="user-select:text">
        <img src="${GetImageResource("logo.png")}" style="display:block;width:30%;height:auto;margin-left:auto;margin-right:auto;">
        <p><b>Version:</b> ${HanoiCollabGlobals.Version}</p>
        <br/>
        <a href="${HanoiCollabGlobals.StableDownload}" style="color:orange;" target="_blank">Check for updates</a>
        <br/>
        <a href="${HanoiCollabGlobals.BetaDownload}" style="color:orange;" target="_blank">Join our beta channel for the latest feature previews.</a>
        <br/>
        <h4>Join us!</h4>
        <div style="display:flex">
            <a href="${HanoiCollabGlobals.DiscordServer}" style="margin:4px" target="_blank"><img src="${GetImageResource("discord.png")}" width="64" height="64" alt="HanoiCollab's Discord Server"/></a>
            <a href="${HanoiCollabGlobals.GithubRepo}" style="margin:4px" target="_blank"><img src="${GetImageResource("github.png")}" width="64" height="64" alt="HanoiCollab's GitHub Repo"/></a>
        </div>
        <br/>
        <p>If you enjoy HanoiCollab, please consider sending a Garena game card to AduMaster#0246 on Discord!</p>
        <button class="hanoicollab-button" value="ok">OK</button>
    </div>
    `), false);
    IsAboutDisplayed = false;
}

export { SetupAbout };

