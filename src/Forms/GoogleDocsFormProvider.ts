import { QuestionInfo } from "../Data/QuestionInfo";
import { QuestionType } from "../Data/QuestionType";
import { AnswerLayout, QuestionLayout } from "../Data/ExamLayout";
import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";
import { FormProvider } from "./FormProvider";
import { FormProviderType } from "./FormProviderType";

import "../Utilities/String";

class GoogleDocsFormProvider extends FormProvider
{
    PatchScript(src: string, code: string): string
    {
        // This _should_ allow Google Forms accept the sandbox,
        // however many stuff are messed up so we dropped the sandbox
        // for Google Forms.
        if (src.includes("viewer_base"))
        {
            code = `
                function setupHook(xhr) {
                    function getter() {
                        console.log('get responseText');
                
                        delete xhr.responseText;
                        var ret = xhr.responseText;
                        if (ret.includes("history.replaceState"))
                        {
                            ret = "window.history.replaceState=function(){};console.log(window.history);" + ret;
                            ret = ret   .replace(/=history\\.pushState/, "=window.parent.history.pushState")
                                        .replace(/=history\\.replaceState/, "=function(){}");    
                        }
                        setup();
                        return ret;
                    }
                
                    function setter(str) {
                        console.log('set responseText: %s', str);
                    }
                
                    function setup() {
                        Object.defineProperty(xhr, 'responseText', {
                            get: getter,
                            set: setter,
                            configurable: true
                        });
                    }
                    setup();
                }

                XMLHttpRequest.prototype.oldOpen = XMLHttpRequest.prototype.open;
                XMLHttpRequest.prototype.open = function(method, url, async, user, password)
                {
                    console.log(url);
                    if (!this._HanoiCollabHooked) {
                        this._HanoiCollabHooked = true;
                        setupHook(this);
                    }
                    XMLHttpRequest.prototype.oldOpen.call(this, method, url, async, user);
                }
            ` + code;
            code =  code.replace(/impressionBatch:[^}]+/g, "impressionBatch: []")
                        .replace(/this.j.send\(a\)/, "this.j.send((function(a){console.log(a);return a;})(a))")
                        .replace(/document\.getElementById\("base-js\"\)\)&&\([A-Za-z]\=[A-Za-z]\.src\?[A-Za-z]\.src.+?length-1]\.src/g, match => match.replace(/\.src/g, `.getAttribute("originalSrc")`));
        }
        return code;

    }

    WaitForTestReady(): Promise<boolean>
    {
        return new Promise<boolean>((resolve, reject) =>
        {
            if (!(window.location.href.includes("/viewform") || window.location.href.includes("/formResponse")))
            {
                resolve(false);
                return;
            }
            var interval = setInterval(function()
            {
                if (HanoiCollabGlobals.Document.querySelectorAll("form").length)
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
    
        for (/* new var in each interation */let q of questions)
        {
            q.AddClearButton();
            q.HtmlElement.querySelector(".hanoicollab-clear-button")?.addEventListener("click", function(){q.UpdateUserAnswer()});
        }
    
        var inputCollection = HanoiCollabGlobals.Document.querySelector("form")!.querySelector("input")!.parentElement as HTMLElement;
        new MutationObserver(function(mutations)
        {
            var ids: IDictionary<boolean> = {};
            for (var mutate of mutations)
            {
                var target = mutate.target as HTMLInputElement;
                if (target?.name?.includes("entry"))
                {
                    ids[target.name.substring("entry.".length)] = true;
                }
            }
            for (let q of questions)
            {
                if (ids[q.Id])
                {
                    q.UpdateUserAnswer();
                }
            }
        }).observe(inputCollection, {subtree: true, childList: true, attributes: true, attributeOldValue : true, attributeFilter: ["value"]})
    }

    SetupCommunityAnswersUI(): void 
    {
        for (let q of HanoiCollabGlobals.Questions)
        {
            // Standalone questions.
            if (q.HtmlElement.getAttribute("role") == "listitem")
            {
                q.HtmlElement.appendChild(q.CommunityAnswersHtml);
            }
            else
            {
                // Limited space, so we'll provide a hover menu.
                q.CommunityAnswersHtml.style.display = "none";
                q.CommunityAnswersHtml.style.position = "fixed";
                q.CommunityAnswersHtml.style.top = "-69420px";
                q.CommunityAnswersHtml.style.margin = "0";
                q.CommunityAnswersHtml.style.padding = "0";
                q.CommunityAnswersHtml.style.background = "rgba(0,127,255,0.9)";
                q.CommunityAnswersHtml.style.zIndex = "9997";
                q.CommunityAnswersHtml.style.minWidth = "10%";
                q.HtmlElement.appendChild(q.CommunityAnswersHtml);

                const hoverOffset = 10;

                q.HtmlElement.addEventListener("mouseenter", function(ev)
                {
                    if (!HanoiCollabGlobals.IsStealthMode)
                    {
                        q.CommunityAnswersHtml.style.display = "block";
                        q.CommunityAnswersHtml.style.left = `${ev.clientX + hoverOffset}`;
                        q.CommunityAnswersHtml.style.top = `${ev.clientY + hoverOffset}`;    
                    }
                });
                q.HtmlElement.addEventListener("mousemove", function(ev)
                {
                    if (!HanoiCollabGlobals.IsStealthMode)
                    {
                        q.CommunityAnswersHtml.style.display = "block";
                        q.CommunityAnswersHtml.style.left = `${ev.clientX + hoverOffset}`;
                        q.CommunityAnswersHtml.style.top = `${ev.clientY + hoverOffset}`;    
                    }
                });
                q.HtmlElement.addEventListener("mouseleave", function()
                {
                    if (!HanoiCollabGlobals.IsStealthMode)
                    {                
                        q.CommunityAnswersHtml.style.display = "none";
                        q.CommunityAnswersHtml.style.top = "-69420px"; 
                    }
                });
            }
        }
    }

    GetType(): FormProviderType
    {
        return FormProviderType.GoogleDocs;
    }

    // Google is way too complex. Leave it alone.
    // We don't have to intercept any form state variables: They're all present in the DOM.
    DisableSandbox(): boolean 
    {
        return true;
    }

    GetFormId(): string 
    {
        return "" + (window.location.href.match(`https:\/\/docs\.google\.com\/forms\/d\/e\/(.*?)\/viewform.*`) ?? window.location.href.match(`https:\/\/docs\.google\.com\/forms\/d\/e\/(.*?)\/formResponse.*`))![1];
    }

    ExtractResources(): string[] 
    {
        var result = [];
        // return result;
        for (var item of Array.from(HanoiCollabGlobals.Document.querySelectorAll("*")).filter(i => i.getAttribute("role") == "listitem"))
        {
            // All items without any choices:
            if (!item.querySelectorAll("input").length && 
                !item.querySelectorAll("textarea").length && 
                !item.querySelectorAll("label").length)
            {
                result.push(...Array.from(item.querySelectorAll("img,iframe")).map((i) => (i as HTMLImageElement | HTMLIFrameElement).src));
            }
        }
        return result;
    }

    ExtractQuestions(): QuestionLayout[] 
    {
        var result = [];
        var questionElements = document.querySelectorAll("[role=\"listitem\"]");
        for (let i = 0; i < questionElements.length; ++i)
        {
            var qElem = questionElements[i];
            var q = JSON.parse((qElem.querySelector("[data-params]") as HTMLElement)?.dataset?.params?.replace("%.@.", "[") ?? "null")?.at(0);
            if (q == null)
            {
                continue;
            }
            var currentQuestionType = QuestionType.None;
            switch (q[3])
            {
                case 0:
                    currentQuestionType = QuestionType.Hybrid;
                break;
                case 1:
                    currentQuestionType = QuestionType.Written;
                break;
                // Multiple choice
                case 2:
                // Multiple choice _GROUP_
                case 7:
                    currentQuestionType = QuestionType.MultipleChoice;
                break;
            }
            if (currentQuestionType == QuestionType.None)
            {
                continue;
            }

            // Questions with subquestions
            if (q[3] == 7)
            {
                var currentMainQuestionDescription = q[1];
                var currentMainQuestionImageResources = Array.from(qElem.querySelectorAll("img")).map((i: HTMLImageElement) => i.src);
                var currentMainQuestionResources = Array.from(qElem.querySelectorAll("iframe")).map((i: HTMLIFrameElement) => i.src);

                var subquestions = q[4];
                var subquestionElements = qElem.querySelectorAll("[role=\"presentation\"]");

                for (let j = 0; j < subquestions.length; ++j)
                {
                    var subquestionId = "" + subquestions[j][0];
                    var subquestionAnswers = subquestions[j][1];
                    var subquestionDescription = subquestions[j][3][0];
                    var currentQuestionDescription = currentMainQuestionDescription + " -- " + subquestionDescription;

                    // Subquestions cannot have resources.
                    var currentQuestionImageResources = currentMainQuestionImageResources;
                    var currentQuestionResources = currentMainQuestionResources;
                    var currentQuestionId = subquestionId;
                    var currentQuestionAnswers = [];

                    var answers = subquestionAnswers;
                    var alpha = "A";
                    for (let j = 0; j < answers.length; ++j)
                    {
                        var a = answers[j];
                        currentQuestionAnswers.push(new AnswerLayout(a[0], [], a[0].getHashCode(), String.fromCharCode(alpha.charCodeAt(0) + j), []));
                    }
                    
                    result.push(new QuestionLayout(currentQuestionType, currentQuestionDescription, currentQuestionId, currentQuestionAnswers, currentQuestionResources, currentQuestionImageResources));
                }
            }
            // Questions without subquestions
            else
            {
                var currentQuestionDescription = q[1] as string;
                var currentQuestionId = "" + q[4][0][0];
                var currentQuestionAnswers = [];
                var resourcesInAnswers = new Array<string>();
                if (currentQuestionType == QuestionType.MultipleChoice)
                {
                    var answers = q[4][0][1];
                    var answerElements = qElem.querySelectorAll("label");
                    var alpha = "A";
                    for (let j = 0; j < answers.length; ++j)
                    {
                        var a = answers[j];
                        var aElem = answerElements[j];
                        var imageResources = Array.from(aElem.querySelectorAll("img")).map(i => i.src);
                        var resources = Array.from(aElem.querySelectorAll("iframe")).map(i => i.src);
                        resourcesInAnswers.push(...imageResources);
                        resourcesInAnswers.push(...resources);
                        currentQuestionAnswers.push(new AnswerLayout(a[0], resources, a[0].getHashCode(), String.fromCharCode(alpha.charCodeAt(0) + j), imageResources));
                    }
                }
                else if (currentQuestionType == QuestionType.Hybrid)
                {
                    var alpha = "A";
                    for (let j = 0; j < 4; ++j)
                    {
                        currentQuestionAnswers.push(new AnswerLayout("", [], String.fromCharCode(alpha.charCodeAt(0) + j), String.fromCharCode(alpha.charCodeAt(0) + j), []));
                    }
                }
                
                var currentQuestionImageResources = Array.from(qElem.querySelectorAll("img")).map(i => i.src).filter(i => !resourcesInAnswers.includes(i));
                var currentQuestionResources = Array.from(qElem.querySelectorAll("iframe")).map(i => i.src).filter(i => !resourcesInAnswers.includes(i));
    
                result.push(new QuestionLayout(currentQuestionType, currentQuestionDescription, currentQuestionId, currentQuestionAnswers, currentQuestionResources, currentQuestionImageResources));
            }

        }
        return result;    
    }

    GetQuestionInfos(): QuestionInfo[] 
    {
        var result = [];
        var questionElements = document.querySelectorAll("[role=\"listitem\"]");
        for (let i = 0; i < questionElements.length; ++i)
        {
            var qElem = questionElements[i] as HTMLElement;
            var q = JSON.parse((qElem.querySelector("[data-params]") as HTMLElement)?.dataset?.params?.replace("%.@.", "[") ?? "null")?.at(0);
            if (q == null)
            {
                continue;
            }
            var currentQuestionType = QuestionType.None;
            switch (q[3])
            {
                case 0:
                    currentQuestionType = QuestionType.Hybrid;
                break;
                case 1:
                    currentQuestionType = QuestionType.Written;
                break;
                case 2:
                case 7:
                    currentQuestionType = QuestionType.MultipleChoice;
                break;
            }
            if (currentQuestionType == QuestionType.None)
            {
                continue;
            }
            var subElems = qElem.querySelectorAll("[role=\"presentation\"]");
            for (var j = 0; j < q[4].length; ++j)
            {
                var currentQuestionId = "" + q[4][j][0];
                var currentElem = qElem;
                // Question group
                if (q[3] == 7)
                {
                    currentElem = subElems[j] as HTMLElement;
                }
                var info = new QuestionInfo(currentElem, currentQuestionId, currentQuestionType, i);
                if (currentQuestionType == "multipleChoice")
                {
                    var answers = q[4][0][1];
                    var alpha = "A";
                    for (let j = 0; j < answers.length; ++j)
                    {
                        var a = answers[j];
                        info.Answers.push({Id: "" + a[0].getHashCode(), Alpha: String.fromCharCode(alpha.charCodeAt(0) + j)});
                    }
                }
                else if (currentQuestionType == "hybrid")
                {
                    var alpha = "A";
                    for (let j = 0; j < 4; ++j)
                    {
                        info.Answers.push({Id: String.fromCharCode(alpha.charCodeAt(0) + j), Alpha: String.fromCharCode(alpha.charCodeAt(0) + j)});
                    }
                }
    
                info.GetUserAnswer = function()
                {
                    var info = this;
                    var input = HanoiCollabGlobals.Document.querySelector("[name=\"entry." + info.Id + "\"]") as HTMLInputElement;
                    var content = input?.value;
                    if (!content || content.length == 0)
                    {
                        return "";
                    }
                    if (info.Type == "multipleChoice")
                    {
                        return content.getHashCode();
                    }
                    else
                    {
                        return content;
                    }
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
                    var input = HanoiCollabGlobals.Document.querySelector("[name=\"entry." + info.Id + "\"]") as HTMLInputElement;
                    // Clear from DOM
                    if (input)
                    {
                        input.value = "";   
                        if (info.Type == "multipleChoice")
                        {
                            input.remove();
                        }
                    }
    
                    // Clear from UI
                    if (info.IsWritten())
                    {
                        var writeArea = info.HtmlElement.querySelector("input,textarea") as HTMLInputElement | HTMLTextAreaElement;
                        if (writeArea)
                        {
                            writeArea.value = "";
                            writeArea.dispatchEvent(new InputEvent("input", {bubbles: true}));
                        }
                    }
                    else
                    {
                        var elem = info.HtmlElement.querySelector("[aria-checked='true']");
                        if (elem)
                        {
                            elem.setAttribute("aria-checked", "false");
                            elem.setAttribute("tabindex", "-1");
                            var clazz = elem.classList[elem.classList.length - 1];
                            elem.classList.remove(clazz);    
                        }
                    }
                }
    
                result.push(info);
            }
        }
        return result;            
    }
}

export { GoogleDocsFormProvider };