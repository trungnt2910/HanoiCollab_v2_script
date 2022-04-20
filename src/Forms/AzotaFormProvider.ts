import { QuestionInfo } from "../Data/QuestionInfo";
import { AnswerLayout, QuestionLayout } from "../Data/ExamLayout";
import { HanoiCollab$ } from "../UI/HanoiCollabQuery";
import { FormProvider } from "./FormProvider";
import { FormProviderType } from "./FormProviderType";
import { QuestionType } from "../Data/QuestionType";
import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";

class AzotaFormProvider extends FormProvider
{
    PatchScript(src: string, code: string): string
    {
        if (src.includes("main") || src.includes("runtime"))
        {
            code = code.replace(/document\.head\.appendChild/g, `(function(child)
            {
                if (child.tagName !== "SCRIPT")
                {
                    document.head.appendChild(child);
                    return;
                }
                if (child.src && child.src.includes("es2015"))
                {
                    var request = new XMLHttpRequest();
                    request.open("GET", child.src, false);
                    request.send(null);
                    var scriptContent = request.responseText;
                    scriptContent = scriptContent.replace(/constructor\\([a-zA-Z_,]*?\\){super\\([a-zA-Z_,]*?\\),*/gm, (match) => {return match + "this;try{if(!window.HanoiCollabExposedVariables)window.HanoiCollabExposedVariables=[];HanoiCollabExposedVariables.push(this);}catch(e){console.log(e);}"});
                    scriptContent = scriptContent.replace(/constructor\\([a-zA-Z_,]*?\\){/gm, (match) => {return match + "try{if(!window.HanoiCollabExposedVariables)window.HanoiCollabExposedVariables=[];HanoiCollabExposedVariables.push(this);}catch(e){console.log(e);}"});
                    var scriptBlob = new Blob([scriptContent], {type: "application/javascript"});
                    var scriptURL = URL.createObjectURL(scriptBlob);
                    child.removeAttribute("integrity");
                    child.src = scriptURL;
                }
                document.head.appendChild(child);
            })`
            );
            code = code.replace(/sendMonitorAction\([A-Za-z_,]*?\){/, match => match + `console.log("Blocked monitor action.");return;`);
            code = code.replace(/trackInfos:[^,}]*/, `trackInfos: null`);
            code = code.replace(/resultTrack:[^,}]*/, `resultTrack: null`);
        }
        return code;
    }

    WaitForTestReady(): Promise<boolean> 
    {
        return new Promise<boolean>(function (resolve, reject)
        {
            // Top, not hanoicollab. HanoiCollab's window is a blob, remember?
            if (!top!.window.location.href.includes("take-test"))
            {
                resolve(false);
                return;
            }
            var hadFormState = false;
            var interval = setInterval(function()
            {
                if (!hadFormState)
                {
                    if (HanoiCollabGlobals.Window.HanoiCollabExposedVariables)
                    {
                        for (var v of HanoiCollabGlobals.Window.HanoiCollabExposedVariables)
                        {
                            if (v.saveToStorage && v.questionList)
                            {
                                // Clean the other junk.
                                HanoiCollabGlobals.Window.HanoiCollabExposedVariables.splice(0, HanoiCollabGlobals.Window.length);
                                // Name from our Office Forms experience.
                                HanoiCollabGlobals.Window.HanoiCollabExposedVariables.FormState = v;
                                // Prevent new junk.
                                HanoiCollabGlobals.Window.HanoiCollabExposedVariables.push = function(){return 0;};
                                hadFormState = true;
                                break;
                            }
                        }
                    }
                }
                else if (HanoiCollab$(".question-content"))
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
                q.HtmlElement.querySelector(".list-answer")!.addEventListener("click", function(){q.UpdateUserAnswer()});
            }
            else
            {
                q.HtmlElement.querySelector("textarea")!.addEventListener("blur", function(){q.UpdateUserAnswer()});
            }
            q.AddClearButton();
            q.HtmlElement.querySelector(".hanoicollab-clear-button")?.addEventListener("click", function(){q.UpdateUserAnswer()});
        }
    }

    GetType(): FormProviderType
    {
        return FormProviderType.Azota;
    }

    GetFormId(): string 
    {
        return "" + HanoiCollabGlobals.Window.HanoiCollabExposedVariables.FormState.exam_obj.id;
    }

    ExtractQuestions(): QuestionLayout[] 
    {
        var result = [];
        var questions = HanoiCollabGlobals.Window.HanoiCollabExposedVariables.FormState.questionList;

        for (let i = 0; i < questions.length; ++i)
        {
            var currentQuestion = questions[i];
            var currentQuestionId = "" + currentQuestion.id;
            var answers = [];
            var currentQuestionType = currentQuestion.answerType == 1 ? "multipleChoice" : "written";
            if (currentQuestion.answerType == 1)
            {
                if (currentQuestion.answerConfigParse[0].key)
                {
                    for (var j = 0; j < currentQuestion.answerConfigParse.length; ++j)
                    {
                        answers.push(new AnswerLayout(currentQuestion.answerConfigParse[j].content.replace("<br>", "\n"), [], currentQuestion.answerConfigParse[j].key, currentQuestion.answerConfigParse[j].alpha || currentQuestion.answerConfigParse[j].content, []));
                    }
                }
                else
                {
                    for (var j = 0; j < currentQuestion.answerConfigParse[0].answer.length; ++j)
                    {
                        //To-Do: Is this shit shuffled?
                        answers.push(new AnswerLayout("", [], currentQuestion.answerConfigParse[0].answer[j].content, currentQuestion.answerConfigParse[0].answer[j].content, []));
                    }
                }
            }
            var currentQuestionResources = [];
            var currentQuestionImageResources = [];
            var currentQuestionDescription = currentQuestion.questionText;
            for (var content of currentQuestion.questionContentParse)
            {
                if (["jpg", "png", "bmp", "svg"].includes(content.extension))
                {
                    currentQuestionImageResources.push(content.url);
                }
                else if (content.extension == "text")
                {
                    currentQuestionDescription += content.content.replace("<br>", "\n");
                }
                else
                {
                    currentQuestionResources.push(content.url);                            
                }
            }
            result.push(new QuestionLayout(currentQuestionType, currentQuestionDescription, currentQuestionId, answers, currentQuestionResources, currentQuestionImageResources));            
        }

        return result;    
    }

    GetQuestionInfos(): QuestionInfo[]
    {
        var result = [];

        var elements = Array.from(HanoiCollabGlobals.Document.querySelectorAll(".question-content")).map(e => e as HTMLElement);
        var questions = HanoiCollabGlobals.Window.HanoiCollabExposedVariables.FormState.questionList;

        for (var i = 0; i < questions.length; ++i)
        {
            var info = new QuestionInfo(elements[i], "" + questions[i].id, questions[i].answerType === 1 ? QuestionType.MultipleChoice : QuestionType.Written, i);

            info.GetUserAnswer = function()
            {
                var info = this;
                var ans = HanoiCollabGlobals.Window.HanoiCollabExposedVariables.FormState.answerList.find(function (a: any)
                {
                    return a.questionId == info.Id;
                });
                if (!ans)
                {
                    return null;
                }
                return ans.answerContent[0].content;
            }

            info.SetUserAnswer = function(answer)
            {
                if (this.SendUserAnswer)
                {
                    this.SendUserAnswer(answer);
                }
                var sheetContentButton = HanoiCollab$(".sheet_content")!.querySelectorAll(".no-answered")[this.Index] as HTMLElement;
                if (answer)
                {                     
                    sheetContentButton.style.backgroundColor = "rgba(60, 141, 188, 1)";
                    sheetContentButton.style.color = "rgb(255, 255, 255)";
                }
                else
                {
                    sheetContentButton.style.background = "#fff";
                    sheetContentButton.style.color =  "#111";
                }
            }

            if (questions[i].answerType === 1)
            {
                if (questions[i].answerConfigParse[0].key)
                {
                    for (var j = 0; j < questions[i].answerConfigParse.length; ++j)
                    {
                        info.Answers.push({Id: questions[i].answerConfigParse[j].key, Alpha: questions[i].answerConfigParse[j].alpha || questions[i].answerConfigParse[j].content});
                    }
                }
                else
                {
                    for (var j = 0; j < questions[i].answerConfigParse[0].answer.length; ++j)
                    {
                        //To-Do: Is this shit shuffled?
                        info.Answers.push({Id: questions[i].answerConfigParse[0].answer[j].content, Alpha: questions[i].answerConfigParse[0].answer[j].content});
                    }
                }

                info.ClearUserAnswer = function()
                {
                    var info = this;
                    var formState = HanoiCollabGlobals.Window.HanoiCollabExposedVariables.FormState;
                    formState.answerList = formState.answerList.filter(function (a: any)
                    {
                        return a.questionId != info.Id;
                    });
                    formState.saveToStorage(formState.answerList, formState.noteList, formState.files);
                    Array.from(HanoiCollab$(this.HtmlElement)!.querySelectorAll(".no-answered")).forEach(function (button)
                    {
                        (button as HTMLElement).style.background = "#fff";
                        (button as HTMLElement).style.color =  "#111";
                    });
                    for (var j = 0; j < questions[info.Index].answerConfigParse.length; ++j)
                    {
                        questions[info.Index].answerConfigParse[j].checked = false;
                    }
                }
            }
            else
            {
                info.ClearUserAnswer = function()
                {
                    var info = this;
                    var formState = HanoiCollabGlobals.Window.HanoiCollabExposedVariables.FormState;
                    formState.answerList = formState.answerList.filter(function (a: any)
                    {
                        return a.questionId != info.Id;
                    });
                    formState.saveToStorage(formState.answerList, formState.noteList, formState.files);
                    Array.from(HanoiCollab$(this.HtmlElement)!.querySelectorAll("textarea")).forEach(function (textArea)
                    {
                        (textArea as HTMLTextAreaElement).value = "";
                    });
                }
            }

            result.push(info);
        }

        return result;
    }
}

export { AzotaFormProvider };