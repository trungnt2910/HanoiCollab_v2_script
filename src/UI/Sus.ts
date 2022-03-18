import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";
import { Html } from "../Utilities/Html";
import { EnableDrag } from "./Drag";
import { AddKeyBinding } from "./KeyBindings";

// New UI element, added since v0.2.0
// Displays all _multiple choice_ questions 
// where users have conflicting answers.
function SetupSuspiciousQuestionsUserInterface()
{
    HanoiCollabGlobals.Document.querySelector("#hanoicollab-sus-questions-container")?.remove();

    var container = Html.createElement(`
    <div id="hanoicollab-sus-questions-container" class="hanoicollab-basic-container" style="position:fixed;right:16px;bottom:calc(20% + 24px);height:15%;width:30%;border-radius:1ex;background-color:rgba(0,127,255,0.9);z-index:9997;user-select:text">
        <p id="hanoicollab-sus-questions-title" style="text-align:center;font-size:16px;line-height:1.5;font-weight:bold;">ඞඞඞඞSuspicious Questionsඞඞඞඞ</p>
        <div id="hanoicollab-sus-questions-list" style="display:none;overflow:auto;max-height:calc(100% - 24px);margin:0">
        </div>
        <div id="hanoicollab-sus-questions-list-none">
            You're doing great! No suspicious questions.
        </div>
    </div>
    `);

    HanoiCollabGlobals.Document.body.appendChild(container);

    EnableDrag(container);

    AddKeyBinding('c', function()
    {
        if (container.style.display == "none")
        {
            container.style.display = "";
        }
        else
        {
            container.style.display = "none";
        }
    });
}

function UpdateSuspiciousQuestionsList()
{
    var list = HanoiCollabGlobals.Document.getElementById("hanoicollab-sus-questions-list") as HTMLElement;
    var listNone = HanoiCollabGlobals.Document.getElementById("hanoicollab-sus-questions-list-none") as HTMLElement;

    var questions = HanoiCollabGlobals.Questions;
    var suspiciousQuestions = [];
    
    for (var q of questions)
    {
        if (q.IsMultipleChoice())
        {
            var alreadyHasAns = false;
            for (var ans in q.CommunityAnswers.MultipleChoice)
            {
                if (q.CommunityAnswers.MultipleChoice[ans].length)
                {
                    if (!alreadyHasAns)
                    {
                        alreadyHasAns = true;
                    }
                    else
                    {
                        suspiciousQuestions.push(q);
                        break;
                    }
                }
            }
        }
    }

    if (suspiciousQuestions.length)
    {
        list.style.display = "block";
        listNone.style.display = "none";
        var div = list.cloneNode(false) as HTMLElement;
        div.innerText = "";
        for (let q of suspiciousQuestions)
        {
            var alphaList = [];
            for (var ans in q.CommunityAnswers.MultipleChoice)
            {
                if (q.CommunityAnswers.MultipleChoice[ans].length)
                {
                    alphaList.push(q.CommunityAnswers.MultipleChoice[ans].Alpha);
                }
            }
            var elem = Html.createElement(
                `
                <div class="hanoicollab-sus-question" style="margin:4px;border-style:solid;overflow:hidden;">
                    <p style="float:left;clear:left;">Question #${q.Index + 1}: ${alphaList.join(",")}</p>
                    <div style="float:right;clear:right;display:flex;">
                        <button class="hanoicollab-button hanoicollab-ping-button" style="margin-left:4px;margin-right:4px;padding:0;max-height:100%">Ping</button>
                        <button class="hanoicollab-button hanoicollab-focus-button" style="margin-left:4px;margin-right:4px;padding:0;max-height:100%">Focus</button>
                    </div>
                    <p style="clear:both;display:block;"></p>
                </div>
                `
            );
            elem.querySelector(".hanoicollab-ping-button")?.addEventListener("click", async function()
            {
                await q.Ping();
            });
            elem.querySelector(".hanoicollab-focus-button")?.addEventListener("click", function()
            {
                HanoiCollabGlobals.ProviderFunctions.FocusQuestion(q);
            });
            div.appendChild(elem);
        }
        list.replaceWith(div);
    }
    else
    {
        list.style.display = "none";
        // Don't make it "block" here, we want stealth mode to work
        // with this element.
        // (Actually it doesn't matter, only the parent container needs to be hidden)
        listNone.style.display = "";
    }
}

export { SetupSuspiciousQuestionsUserInterface, UpdateSuspiciousQuestionsList };