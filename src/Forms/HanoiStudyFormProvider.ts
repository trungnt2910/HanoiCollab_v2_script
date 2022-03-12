import { QuestionType } from "../Data/QuestionType";
import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";
import { FormProvider } from "./FormProvider";
import { FormProviderType } from "./FormProviderType";
import { AnswerLayout, QuestionLayout } from "../Data/ExamLayout";
import { QuestionInfo } from "../Data/QuestionInfo";
import { AnswerInfo } from "../Data/AnswerInfo";
import { HanoiCollab$ } from "../UI/HanoiCollabQuery";
import { Html } from "../Utilities/Html";

class HanoiStudyFormProvider extends FormProvider
{
    PatchScript(src: string, code: string): string 
    {
        if (src.includes("site.js"))
        {
            code = code.replace(/LogEvent\([^\)]*?\)\s*?{/g, match => match + `console.log("Blocked monitor action");return;`);
        }
        return code;
    }

    PatchElement(element: Element): void 
    {
        if (element.tagName == "SCRIPT")
        {
            element.innerHTML = element.innerHTML.replace(/ShowFullScreen\([\)]*?\)\s*?\{/, match => match + `console.log("Blocked full screen request");return;`);
        } 
    }

    async WaitForTestReady(): Promise<boolean>
    {
        var isTest = await new Promise<boolean>((resolve, reject) =>
        {
            if (!window.location.href.includes("lam-bai"))
            {
                resolve(false);
                return;
            }
            var interval = setInterval(function()
            {
                if (HanoiCollabGlobals.Document.querySelector(".test-body") && HanoiCollabGlobals.Window.ExamId)
                {
                    clearInterval(interval);
                    resolve(true);
                    return;
                }
            });
        });

        if (!isTest)
        {
            return false;
        }

        HanoiCollabGlobals.Window.ShowFullScreen = function(){ console.log("Blocked full screen request."); };
        HanoiCollabGlobals.Window.LogEvent = function(){ console.log("Blocked monitor action."); };
        HanoiCollabGlobals.Document.documentElement.requestFullscreen = function(){ return Promise.resolve(console.log("Blocked full screen request.")); };

        for (var box of HanoiCollabGlobals.Document.querySelectorAll(".question-box"))
        {
            var lbl = Array.from(box.querySelectorAll('label')).sort((l1, l2) => l1.htmlFor.localeCompare(l2.htmlFor))[0];
            lbl.closest(".splip-answer")?.appendChild(
                Html.createElement(
                `
                <div class="hanoicollab-answer-recommend" style="color: green;">(Recommended answer)</div>
                `
            ));
        }

        return true;
    }

    SetupElementHooks(): void 
    {
        var questions = HanoiCollabGlobals.Questions;
    
        for (/* new var in each interation */let q of questions)
        {
            q.AddClearButton();
            q.HtmlElement.querySelector(".hanoicollab-clear-button")?.addEventListener("click", function(){q.UpdateUserAnswer()});
            for (var elem of q.HtmlElement.querySelectorAll("input"))
            {
                var i = elem as HTMLInputElement;
                i.addEventListener("click", function(){q.UpdateUserAnswer()});
            }
        }
    }

    GetType(): FormProviderType
    {
        return FormProviderType.HanoiStudy;
    }

    // Some dumb HTTP header is preventing us from creating blob iframes.
    // Disable sandboxing for now.
    DisableSandbox() : boolean
    {
        return true;
    }

    GetFormId(): string 
    {
        return HanoiCollabGlobals.Window.ExamId?.toString() ?? "";
    }

    ExtractResources(): string[] 
    {
        return [];
    }

    ExtractQuestions(): QuestionLayout[] 
    {
        // Extracted from HanoiCollab v1.
        function GetRealText(element: HTMLElement): string
        {
            var clone = element.cloneNode(true) as HTMLElement;
            var mathText = clone.getElementsByClassName("mjx-chtml");
            var mathScript = Array.from(clone.getElementsByTagName("script")).filter(elem => elem.type.startsWith("math/"));
            for (var i = 0; i < mathText.length; ++i)
            {
                mathText[i].parentElement!.replaceChild(document.createTextNode(mathScript[i].innerText), mathText[i]);
                mathScript[i].parentElement!.replaceChild(document.createTextNode(""), mathScript[i]);
            }
            var img = clone.getElementsByTagName("img");
            for (i = 0; i < img.length; ++i)
            {
                img[i].parentElement!.replaceChild(document.createTextNode(img[i].src), img[i]);
            }
            return clone.innerText.trim();
        }

        var result = [];
        var questionElements = document.querySelectorAll(".question-box");
        for (let i = 0; i < questionElements.length; ++i)
        {
            var qElem = questionElements[i];
            // Does the government have enough budget for funding
            // a website with written answers? I don't know.
            // == For legal reasons, that's a _joke_ ==
            var currentQuestionType = QuestionType.MultipleChoice;
            // Math bullshit are common in HanoiStudy. We'll have to extract the real text.
            var currentQuestionDescription = GetRealText(qElem.querySelector(".question-box-title") as HTMLElement);
            var currentQuestionId = Array.from(qElem.querySelectorAll("label")).map((e: Element) => e.getAttribute("for")!).sort()[0];
            var currentQuestionAnswers = [];
            var currentQuestionImages = Array.from(qElem.querySelector(".question-box-title")!.querySelectorAll("img")).map(elem => elem.src);
 
            var answerElements = qElem.querySelectorAll(".splip-answer");
            for (let j = 0; j < answerElements.length; ++j)
            {
                var aElem = answerElements[j];
                currentQuestionAnswers.push(new AnswerLayout(
                    GetRealText(aElem.querySelector(".text-ans")!), 
                    [], 
                    aElem.querySelector("label")!.htmlFor, 
                    aElem.querySelector("label")!.innerText.substring(0, 1),
                    Array.from(aElem.querySelectorAll("img")).map(img => img.src)));
            }
            
            result.push(new QuestionLayout(currentQuestionType, currentQuestionDescription, currentQuestionId, currentQuestionAnswers, [], currentQuestionImages));
        }
        return result;
    }

    GetQuestionInfos(): QuestionInfo[] 
    {
        var result = [];
        var questionElements = document.querySelectorAll(".question-box");
        for (let i = 0; i < questionElements.length; ++i)
        {
            var qElem = questionElements[i] as HTMLElement;
            var currentQuestionType = QuestionType.MultipleChoice;
            var currentQuestionId = Array.from(qElem.querySelectorAll("label")).map((e: Element) => e.getAttribute("for")!).sort()[0];
            var info = new QuestionInfo(qElem, currentQuestionId, currentQuestionType, i);
            
            var answerElements = qElem.querySelectorAll("label");
            for (let j = 0; j < answerElements.length; ++j)
            {
                var aElem = answerElements[j];
                var answerInfo = new AnswerInfo();
                answerInfo.Id = aElem.getAttribute("for")!;
                answerInfo.Alpha = aElem.innerText.substring(0, 1);
                info.Answers.push(answerInfo);
            }

            info.GetUserAnswer = function()
            {
                var info = this;
                var content = Array.from(info.HtmlElement.querySelectorAll("input")).filter(e => e.checked).at(0)?.parentElement?.querySelector("label")?.getAttribute("for");
                if (!content || content.length == 0)
                {
                    return "";
                }
                return content;
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
                var info = this;
                var uniqueQuestionId = info.HtmlElement.getAttribute("data-id")!;
                var storage = localStorage.getItem(HanoiCollabGlobals.Window.localSaveResultKey);
                if (storage)
                {
                    var result = JSON.parse(storage) as Array<{QuestionId: string, AnswerId: string}>;
                    var id = result.findIndex((e: any) => e.QuestionId == uniqueQuestionId);
                    // To-Do: Splice or delete?
                    if (id != -1)
                    {
                        result.splice(id, 1);
                    }
                    localStorage.setItem(HanoiCollabGlobals.Window.localSaveResultKey, JSON.stringify(result));
                }
                if (HanoiCollabGlobals.Window.testResultLocalObject)
                {
                    var id = HanoiCollabGlobals.Window.testResultLocalObject.findIndex((e: any) => e.QuestionId == uniqueQuestionId);
                    // To-Do: Splice or delete?
                    if (id != -1)
                    {
                        HanoiCollabGlobals.Window.testResultLocalObject.splice(id, 1);
                    }
                }

                for (var input of info.HtmlElement.querySelectorAll("input"))
                {
                    input.checked = false;
                }

                // Clear from UI, method taken from the "official" js file.
                function UpdateNumberAnsweredAndNotAnswer() {
                    HanoiCollab$('#total-has-answer')!.innerHTML = HanoiCollabGlobals.Window.testResultLocalObject?.length.toString() ?? "0";
                    HanoiCollab$('#total-has-answermobile')!.innerHTML = HanoiCollabGlobals.Window.testResultLocalObject?.length.toString() ?? "0";
                }

                HanoiCollab$('#q-prick-' + uniqueQuestionId)?.classList.add("box-no-anwser");
                HanoiCollab$('#q-prick-' + uniqueQuestionId)?.classList.remove("box-has-anwser");
                HanoiCollab$('#q-prick-' + uniqueQuestionId+'-mobile')?.classList.add("box-no-anwser");
                HanoiCollab$('#q-prick-' + uniqueQuestionId+'-mobile')?.classList.remove("box-has-anwser");
                HanoiCollab$('#q-' + uniqueQuestionId)?.classList.remove("question-active");
                UpdateNumberAnsweredAndNotAnswer();
                HanoiCollab$('#q-title-' + uniqueQuestionId)?.classList.remove('title-index-question-list-active');
                HanoiCollab$('#qm-title-' + uniqueQuestionId)?.classList.remove('title-index-question-list-active');
            }

            result.push(info);
        }
        return result;            
    }
}

export { HanoiStudyFormProvider };