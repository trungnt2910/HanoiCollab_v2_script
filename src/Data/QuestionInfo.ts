import { Html } from "../Utilities/Html";
import { AnswerInfo } from "./AnswerInfo";
import { CommunityAnswerInfo } from "./CommunityAnswerInfo";
import { HanoiCollabGlobals } from "./HanoiCollabGlobals";
import { QuestionType } from "./QuestionType";

class QuestionInfo
{
    HtmlElement: HTMLElement;
    Type: QuestionType;
    Id: string;
    Index: number;
    CommunityAnswersHtml: HTMLElement
    Answers: AnswerInfo[];
    CommunityAnswers: CommunityAnswerInfo;

    SendUserTimeOut: Boolean;
    NeedsUpdate: Boolean;

    constructor(htmlElement: HTMLElement, id: string, type: QuestionType, index: number)
    {
        this.HtmlElement = htmlElement;
        this.Id = id;
        this.Type = type;
        this.Index = index;

        this.CommunityAnswersHtml = Html.createElement(
            `
            <div class="hanoicollab-community-answers">
                <div class="hanoicollab-community-answers-header">Community answers:</div>
                <div class="hanoicollab-community-answers-multiple-choice">
                    <div class="hanoicollab-community-answers-multiple-choice-header">Multiple choice:</div>
                    <div class="hanoicollab-community-answers-multiple-choice-contents"></div>
                </div>
                <div class="hanoicollab-community-answers-written">
                    <div class="hanoicollab-community-answers-written-header">Written:</div>
                    <select class="hanoicollab-community-answers-written-select">
                    </select>
                    <div class="hanoicollab-community-answers-written-content" style="user-select:text;"></div>
                </div>
            </div>
            `
        );

        if (this.Type == QuestionType.MultipleChoice)
        {
            (this.CommunityAnswersHtml.querySelector(".hanoicollab-community-answers-written") as HTMLElement).style.display = "none";
        }

        if (this.Type == "written")
        {
            (this.CommunityAnswersHtml.querySelector(".hanoicollab-community-answers-multiple-choice") as HTMLElement).style.display = "none";
        }

        var info = this;
        this.CommunityAnswersHtml.querySelector("select")!.addEventListener("change", function()
        {
            info.UpdateWrittenSelect(this);
        });

        this.Answers = [];
        this.CommunityAnswers = (new Array<{User: string, Answer: string}>()) as CommunityAnswerInfo;
        this.CommunityAnswers.MultipleChoice = {};

        this.SendUserTimeOut = false;
        this.NeedsUpdate = false;
    }

    IsMultipleChoice()
    {
        return this.Type == "multipleChoice" || this.Type == "hybrid";
    }

    IsWritten()
    {
        return this.Type == "written" || this.Type == "hybrid";
    }

    GetUserAnswer(): string
    {
        throw "Not implemented";
    }
    
    SetUserAnswer(answer: string)
    {
        throw "Not implemented";
    }

    UpdateUserAnswer()
    {
        var q = this;
        // Set timeout, to wait for other event handlers:
        setTimeout(function()
        {
            var answer = q.GetUserAnswer();
            q.SetUserAnswer(answer);    
        }, 100);
    }

    async SendUserAnswer(answer: string)
    {
        if (HanoiCollabGlobals.ExamConnection)
        {
            var info = this;
            if (info.SendUserTimeOut)
            {
                info.NeedsUpdate = true;
                return;
            }
            info.SendUserTimeOut = true;
            info.NeedsUpdate = false;
            // Throughout the transition to TypeScript we have replaced various 
            // `null` values to the empty string. Check for the empty string
            // and convert to null here.
            await HanoiCollabGlobals.ExamConnection.invoke("UpdateAnswer", HanoiCollabGlobals.ProviderFunctions.GetFormId(), info.Id, answer == "" ? null : answer);
            setTimeout(function()
            {
                info.SendUserTimeOut = false;
                if (info.NeedsUpdate)
                {
                    info.SendUserAnswer(info.GetUserAnswer());
                }
            }, 1000);
        }
    }

    ClearUserAnswer()
    {
        throw "Not implemented";
    }

    UpdateWrittenSelect(select: HTMLSelectElement)
    {
        var value = select.value;
        if (!value)
        {
            return;
        }
        var contentElement = select.parentElement!.querySelector(".hanoicollab-community-answers-written-content") as HTMLDivElement;
        contentElement.innerText = this.CommunityAnswers.find(function(ans){return ans.User == value})?.Answer ?? "";
    }

    UpdateCommunityAnswersHtml()
    {
        var info = this;
        if (info.IsMultipleChoice())
        {
            var communityAnswers = info.CommunityAnswers;
            var multipleChoice = communityAnswers.MultipleChoice;
            var communityAnswersHtml = info.CommunityAnswersHtml;
            var multipleChoiceHtml = communityAnswersHtml.querySelector(".hanoicollab-community-answers-multiple-choice-contents")!;
            var elem = HanoiCollabGlobals.Document.createElement("div");
            for (var key of Object.keys(multipleChoice).sort(function(key1, key2){return multipleChoice[key1].Alpha.localeCompare(multipleChoice[key2].Alpha)}))
            {
                if (multipleChoice[key].Alpha)
                {
                    var p = HanoiCollabGlobals.Document.createElement("p");
                    p.innerHTML = `<b>${multipleChoice[key].Alpha}</b> (${multipleChoice[key].length}): ${multipleChoice[key].slice(0, Math.min(multipleChoice[key].length, 10)).join(", ").escapeHTML()}`;
                    elem.appendChild(p);
                }
            }
            multipleChoiceHtml.innerHTML = elem.innerHTML;
        }

        if (info.IsWritten())
        {
            var communityAnswers = info.CommunityAnswers;
            var communityAnswersHtml = info.CommunityAnswersHtml;
            var writtenSelect = communityAnswersHtml.querySelector(".hanoicollab-community-answers-written-select") as HTMLSelectElement;
            var newSelect = HanoiCollabGlobals.Document.createElement("select");
            for (var ans of communityAnswers.sort(
                function(a, b){return (a.Answer.length != b.Answer.length) ? b.Answer.length - a.Answer.length : a.User.localeCompare(b.User)}))
            {
                var option = HanoiCollabGlobals.Document.createElement("option");
                option.value = ans.User;
                option.innerText = `${ans.User} (${ans.Answer.length}) characters`;
                newSelect.appendChild(option);
            }
            writtenSelect.innerHTML = newSelect.innerHTML;
            info.UpdateWrittenSelect(writtenSelect);
        }
    }

    AddClearButton()
    {
        var q = this;
        var button = HanoiCollabGlobals.Document.createElement("button");
        button.innerText = "Clear";
        button.className = "hanoicollab-clear-button";
        button.type = "button";
        button.addEventListener("click", function() {q.ClearUserAnswer();});
        q.HtmlElement.appendChild(button);  
    }
};

export { QuestionInfo };