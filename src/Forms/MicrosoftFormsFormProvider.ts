import { AnswerLayout, QuestionLayout } from "../Data/ExamLayout";
import { QuestionInfo } from "../Data/QuestionInfo";
import { QuestionType } from "../Data/QuestionType";
import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";
import { HanoiCollab$ } from "../UI/HanoiCollabQuery";
import { FormProvider } from "./FormProvider";
import { FormProviderType } from "./FormProviderType";

import "../Utilities/String";

// Microsoft obfuscates its internal scripts.
// If anything breaks, look here first.
function ResolveName(str: string)
{
    switch (str)
    {
        case "Data":
            return "$$";
        case "Id":
            return "$H";
        case "Questions":
            return "$g";
        case "Answer":
            return "$f";
    }
    
    throw new Error("Invalid Office Forms FormState name: " + str);
}

class MicrosoftFormsFormProvider extends FormProvider
{
    PatchScript(src: string, code: string): string
    {
        if (src.includes("page.min"))
        {
            code = code
                .replace("return(t=t||c.length!==Object.keys(n).length)?i:n", "return(t=t||c.length!==Object.keys(n).length)?(function(i){window.HanoiCollabExposedVariables=window.HanoiCollabExposedVariables||[];window.HanoiCollabExposedVariables.FormState=i;return i})(i):n")
                .replace("function s(n){var r=(0,o.cF)", "function s(n){window.HanoiCollabExposedVariables=window.HanoiCollabExposedVariables||[];window.HanoiCollabExposedVariables.UpdateLocalStorage=f;var r=(0,o.cF)");
        }
        return code;
    }

    WaitForTestReady(): Promise<boolean>
    {
        return new Promise<boolean>((resolve, reject) =>
        {
            if (!top!.window.location.href.includes("Pages/ResponsePage.aspx"))
            {
                resolve(false);
                return;
            }
            var hadFormState = false;
            var interval = setInterval(function()
            {
                if (!hadFormState)
                {
                    if (HanoiCollabGlobals.Window.HanoiCollabExposedVariables && HanoiCollabGlobals.Window.HanoiCollabExposedVariables.FormState)
                    {
                        hadFormState = true;
                    }
                }
                else if (HanoiCollab$(".office-form-question-content"))
                {
                    clearInterval(interval);
                    resolve(true);
                    return;
                }
            }, 1000);
        });
    }

    SetupElementHooks(): void
    {
        var questions = HanoiCollabGlobals.Questions;
    
        for (/* new var in each interation */let q of questions)
        {
            if (q.Type == "multipleChoice")
            {
                for (var row of q.HtmlElement.getElementsByClassName("office-form-question-choice-row"))
                {
                    row.addEventListener("click", function(){q.UpdateUserAnswer()});
                }
            }
            else
            {
                q.HtmlElement.querySelector(".office-form-textfield-input")!.addEventListener("blur", function(){q.UpdateUserAnswer()});
            }
            q.AddClearButton();
            q.HtmlElement.querySelector(".hanoicollab-clear-button")?.addEventListener("click", function(){q.UpdateUserAnswer()});
        }
    }

    GetType(): FormProviderType
    {
        return FormProviderType.MicrosoftForms;
    }

    GetFormId(): string
    {
        return "" + HanoiCollabGlobals.Window.HanoiCollabExposedVariables.FormState[ResolveName("Data")][ResolveName("Id")];
    }

    ExtractQuestions(): QuestionLayout[] 
    {
        var result = [];
        var elements = HanoiCollabGlobals.Document.querySelectorAll(".office-form-question-content");
        var questions = HanoiCollabGlobals.Window.HanoiCollabExposedVariables.FormState[ResolveName("Data")][ResolveName("Questions")];

        for (let i = 0; i < elements.length; ++i)
        {
            var currentQuestionId = elements[i].querySelector(".question-title-box")!.id.substring("QuestionId_".length);
            var currentQuestion = questions[currentQuestionId];
            var answers = [];
            var currentQuestionType = null;
            if (currentQuestion.info.type == "Question.Choice")
            {
                var alpha = "A";
                for (var j = 0; j < currentQuestion.info.choices.length; ++j)
                {
                    var currentAnswer = currentQuestion.info.choices[j];
                    answers.push(new AnswerLayout(currentAnswer.description, [], currentAnswer.description.getHashCode(), String.fromCharCode(alpha.charCodeAt(0) + j), []));
                }
                currentQuestionType = "multipleChoice";
            }
            else
            {
                currentQuestionType = "written";
            }
            var currentQuestionImageResources = null;
            if (currentQuestion.info.image)
            {
                currentQuestionImageResources = [currentQuestion.info.image];
            }
            var currentQuestionDescription = currentQuestion.info.title;
            if (currentQuestion.info.subtitle)
            {
                currentQuestionDescription += "\n" + currentQuestion.info.subtitle;
            }
            result.push(new QuestionLayout(currentQuestionType, currentQuestionDescription, currentQuestionId, answers, [], currentQuestionImageResources ?? []));            
        }
        return result;    
    }

    GetQuestionInfos(): QuestionInfo[]
    {
        var result = [];
        var elements = HanoiCollabGlobals.Document.querySelectorAll(".office-form-question-content");
        var questions = HanoiCollabGlobals.Window.HanoiCollabExposedVariables.FormState[ResolveName("Data")][ResolveName("Questions")];

        for (let i = 0; i < elements.length; ++i)
        {
            var currentQuestionId = elements[i].querySelector(".question-title-box")!.id.substring("QuestionId_".length);
            var currentQuestion = questions[currentQuestionId];
            var info = new QuestionInfo(elements[i] as HTMLElement, currentQuestionId, currentQuestion.info.type == "Question.Choice" ? QuestionType.MultipleChoice : QuestionType.Written, i);

            info.GetUserAnswer = function()
            {
                var info = this;
                var content = HanoiCollabGlobals.Window.HanoiCollabExposedVariables.FormState[ResolveName("Data")][ResolveName("Questions")][info.Id].runtime[ResolveName("Answer")];
                if (!content || content.length == 0)
                {
                    return null;
                }
                if (info.IsMultipleChoice())
                {
                    // Array of choices.
                    return content[0].getHashCode();
                }
                else
                {
                    // String
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

            if (info.IsMultipleChoice())
            {
                var alpha = "A";
                for (let j = 0; j < currentQuestion.info.choices.length; ++j)
                {
                    info.Answers.push({Id: currentQuestion.info.choices[j].description.getHashCode(), Alpha: String.fromCharCode(alpha.charCodeAt(0) + j)});
                }

                info.ClearUserAnswer = function()
                {
                    var info = this;
                    HanoiCollabGlobals.Window.HanoiCollabExposedVariables.FormState[ResolveName("Data")][ResolveName("Questions")][info.Id].runtime[ResolveName("Answer")] = [];
                    for (var input of info.HtmlElement.getElementsByTagName("input"))
                    {
                        input.checked = false;
                    }
                    if (HanoiCollabGlobals.Window.HanoiCollabExposedVariables.UpdateLocalStorage)
                    {
                        HanoiCollabGlobals.Window.HanoiCollabExposedVariables.UpdateLocalStorage(
                            HanoiCollabGlobals.Window.HanoiCollabExposedVariables.FormState[ResolveName("Data")]
                        );    
                    }
                }
            }
            else
            {
                info.ClearUserAnswer = function()
                {
                    var info = this;
                    HanoiCollabGlobals.Window.HanoiCollabExposedVariables.FormState[ResolveName("Data")][ResolveName("Questions")][info.Id].runtime[ResolveName("Answer")] = "";
                    for (var input of info.HtmlElement.getElementsByTagName("input"))
                    {
                        input.value = "";
                    }
                    if (HanoiCollabGlobals.Window.HanoiCollabExposedVariables.UpdateLocalStorage)
                    {
                        HanoiCollabGlobals.Window.HanoiCollabExposedVariables.UpdateLocalStorage(
                            HanoiCollabGlobals.Window.HanoiCollabExposedVariables.FormState[ResolveName("Data")]
                        );    
                    }
                }
            }

            result.push(info);
        }
        return result;
    }
}

export { MicrosoftFormsFormProvider };