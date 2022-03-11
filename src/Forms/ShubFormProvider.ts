import { AnswerLayout, QuestionLayout } from "../Data/ExamLayout";
import { QuestionInfo } from "../Data/QuestionInfo";
import { QuestionType } from "../Data/QuestionType";
import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";
import { FormProvider } from "./FormProvider";
import { FormProviderType } from "./FormProviderType";

class ShubFormProvider extends FormProvider
{
    PatchScript(src: string, code: string): string
    {
        if (src.includes("_app"))
        {
            // This should block monitor action INSIDE THE IFRAME, however we're not using it because:
            // - It does NOT block monitor action in the main script.
            // - It takes a long time to apply this patch.
            // code = code.replace(`key:"add",value:function(e,t){this.userTestId`, `key:"add",value:function(e,t){console.log("Blocked monitor action");console.log(e);return;this.userTestId`)
            code = code.replace(`component:"a",href:n`, `component:"a",href:(function(n){if(!window.HanoiCollabExposedVariables)window.HanoiCollabExposedVariables=[];if(!window.HanoiCollabExposedVariables.ExposedFiles)window.HanoiCollabExposedVariables.ExposedFiles=[];window.HanoiCollabExposedVariables.ExposedFiles.push(n);return n;})(n)`)
        }
        return code;
    }

    WaitForTestReady(): Promise<boolean>
    {
        return new Promise<boolean>(function (resolve, reject)
        {
            if (!top!.window.location.href.endsWith("/test"))
            {
                resolve(false);
                return;
            }
            var interval = setInterval(function()
            {
                if (HanoiCollabGlobals.Document.querySelectorAll("[id^=cell]"))
                {
                    clearInterval(interval);
                    resolve(true);
                    return;
                }
            });
        });
    }

    SetupElementHooks(): void
    {
        var questions = HanoiCollabGlobals.Questions;
    
        if (HanoiCollabGlobals.Provider == "shub.edu.vn")
        {
            var inputAnsKey = HanoiCollabGlobals.Document.getElementById("inputAnsKey") as HTMLElement;
            new MutationObserver(function(mutations)
            {
                for (var mutation of mutations)
                {
                    HanoiCollabGlobals.Questions[Number.parseInt(mutation.oldValue!.substring("Đáp án câu ".length)) - 1].UpdateUserAnswer();
                    var target = mutation.target as HTMLInputElement;
                    target.closest(".MuiBox-root")!.querySelector(".hanoicollab-community-answers")?.remove();
                    target.closest(".MuiBox-root")!.appendChild(HanoiCollabGlobals.Questions[Number.parseInt(target.placeholder.substring("Đáp án câu ".length)) - 1].CommunityAnswersHtml);
                }
            }).observe(inputAnsKey, {subtree: false, childList: false, attributes: true, attributeOldValue : true, attributeFilter: ["placeholder"]})
            // Very annoying and covers community answers.
            inputAnsKey.setAttribute("autocomplete", "off");
            inputAnsKey.addEventListener("blur", function()
            {
                for (let q of questions)
                {
                    if (q.HtmlElement.style.border.startsWith("2px"))
                    {
                        q.UpdateUserAnswer();
                    }
                }
            });
        }
    }

    SetupCommunityAnswersUI(): void
    {
        for (var q of HanoiCollabGlobals.Questions)
        {
            // Active question.
            if (q.HtmlElement.style.border.startsWith("2px"))
            {
                q.HtmlElement.closest(".MuiBox-root")!.appendChild(q.CommunityAnswersHtml);
                return;
            }
        }
        var q = HanoiCollabGlobals.Questions[0];
        q.HtmlElement.closest(".MuiBox-root")!.appendChild(q.CommunityAnswersHtml);
    }

    GetType(): FormProviderType
    {
        return FormProviderType.Shub;
    }

    GetFormId(): string 
    {
        return "" + top!.location.href.match(/homework\/([\d]+?)\/test/)![1];    
    }

    ExtractResources(): string[]
    {
        return HanoiCollabGlobals.Window.HanoiCollabExposedVariables?.ExposedFiles?.filter(function (a, b, c) 
        {
            return c.indexOf(a) === b;
        }) ?? [];       
    }

    ExtractQuestions(): QuestionLayout[]
    {
        // To-do: SHUB questions may have multimedia resources.
        var result = [];
    
        // To-do: SHUB questions might also have descriptions.
        for (var q of HanoiCollabGlobals.Questions)
        {
            var answers = [];
            for (var a of q.Answers)
            {
                answers.push(new AnswerLayout("", [], a.Id, a.Alpha, []));
            }
            result.push(new QuestionLayout("hybrid", "SHUB question #" + (q.Index.valueOf() + 1), q.Id, answers, [], []));
        }

        return result;
    }

    GetQuestionInfos(): QuestionInfo[]
    {
        var result = [];
        var elements = HanoiCollabGlobals.Document.querySelectorAll("[id^=cell]");

        for (let i = 0; i < elements.length; ++i)
        {
            var currentQuestionId = elements[i].id.substring("cell-".length);
            var info = new QuestionInfo(elements[i] as HTMLElement, currentQuestionId, QuestionType.Hybrid, i);

            info.GetUserAnswer = function()
            {
                var info = this;
                var text = this.HtmlElement.getElementsByTagName("p")[0].innerText;
                var colonIndex = text.indexOf(":");
                if (colonIndex == -1)
                {
                    return "";
                }
                text = text.substring(colonIndex + 1);
                if (!text)
                {
                    return "";
                }
                return text;
            }

            info.SetUserAnswer = function(answer)
            {
                if (this.SendUserAnswer)
                {
                    this.SendUserAnswer(answer);
                }
            }

            info.ClearUserAnswer = function()
            {
                // May or may not be implemented using simulation.
                throw "Not implemented.";
            }

            var alpha = "A";
            for (let j = 0; j < 4; ++j)
            {
                info.Answers.push({Id: String.fromCharCode(alpha.charCodeAt(0) + j), Alpha: String.fromCharCode(alpha.charCodeAt(0) + j)});
            }

            result.push(info);
        }
        return result;
    }
}

export { ShubFormProvider };