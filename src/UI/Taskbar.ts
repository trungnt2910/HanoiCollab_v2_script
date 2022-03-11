import { Html } from "../Utilities/Html";
import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";
import { HanoiCollab$ } from "./HanoiCollabQuery";

function SetupTaskbar()
{
    var d = new Date(Date.now());
    var elem = Html.createElement(
        `  
<div id="hanoicollab-fake-taskbar" style="bottom:0;right:0;left:0;position:fixed;height:48px;background:rgb(227,238,249);margin:0;z-index=9999;">
    <img style="height:48px;position:absolute;left:0;" src="https://raw.githubusercontent.com/trungnt2910/HanoiCollab_v2/master/Clients/Images/IconsWithEdge.png"></img>
    <img style="height:48px;position:absolute;right:0;" src="https://raw.githubusercontent.com/trungnt2910/HanoiCollab_v2/master/Clients/Images/IconsRight.png"></img>
    <div id="hanoicollab-fake-taskbar-time" style="background:rgb(227,238,249);font-family: 'Segoe UI', Arial, sans-serif;font-size: 12.5px;text-align: right;height:48;display:flex;justify-content:right;align-items:center;position:absolute;right:47.5px;top:0;margin:0">
        <p>
            <span>${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}</span>
            <br/>
            <span>${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}</span>
        </p>
    </div>
    <hr style="height:1px;position:absolute;top:0;width:100%;border-width:0px;background-color:rgb(213,223,233);margin:0;padding:0"></hr>
</div>
        `);
    // Taskbar element should be unaffected by stealth mode.
    elem.style.display = "none";
    // And only allow for top iframes. Google Forms hosted in Quilgo should not listen.
    if (window == top)
    {
        HanoiCollabGlobals.Document.body.appendChild(elem);
        // flex -> none.
        HanoiCollab$("#hanoicollab-fake-taskbar-time")!.style.display = "none";
        var taskbarDisplayed = false;
        HanoiCollabGlobals.Document.addEventListener("keydown", function(e)
        {
            if (e.altKey && e.key === 't')
            {
                taskbarDisplayed = !taskbarDisplayed;
                HanoiCollab$("#hanoicollab-fake-taskbar-time")!.style.display = taskbarDisplayed ? "flex" : "none";
                HanoiCollab$("#hanoicollab-fake-taskbar")!.style.display = taskbarDisplayed ? "block" : "none";
                if (taskbarDisplayed)
                {
                    var style = HanoiCollabGlobals.Document.createElement("style");
                    style.innerHTML = `
                    ::-webkit-scrollbar {
                        display: none;
                    }
                    `;
                    style.id = "hanoicollab-hide-scrollbar-style";
                    HanoiCollabGlobals.Document.head.appendChild(style);
                }
                else
                {
                    HanoiCollabGlobals.Document.getElementById("hanoicollab-hide-scrollbar-style")?.remove();
                }
            }
        });
        setInterval(function()
        {
            var d = new Date(Date.now());
            HanoiCollab$("#hanoicollab-fake-taskbar-time")!.innerHTML = 
            `
            <p>
                <span>${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}</span>
                <br/>
                <span>${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}</span>
            </p>
            `
        }, 1000);
    }
}

export { SetupTaskbar };