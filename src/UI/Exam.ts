import { HubConnectionBuilder } from "@microsoft/signalr";
import { ExamLayout } from "../Data/ExamLayout";
import { CommunityAnswerInfoWritten, CommunityAnswerInfoMultipleChoiceAnswer } from "../Data/CommunityAnswerInfo";
import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";
import { GetToken } from "./Login";
import { HanoiCollabConnection } from "../Data/HanoiCollabConnection";

async function SetupExamConnection()
{
    if (HanoiCollabGlobals.ExamConnection)
    {
        return HanoiCollabGlobals.ExamConnection;
    }

    var connection = new HubConnectionBuilder()
        .withUrl(HanoiCollabGlobals.Server + "hubs/exam", { accessTokenFactory: GetToken })
        .build() as HanoiCollabConnection;
    
    HanoiCollabGlobals.ExamConnection = connection;

    var questions = HanoiCollabGlobals.Questions;

    connection.on("InitializeExam", async function(onlineQuestions)
    {
        for (var q of questions)
        {
            if (q.IsMultipleChoice())
            {
                for (var a of q.Answers)
                {
                    q.CommunityAnswers.MultipleChoice[a.Id] = new CommunityAnswerInfoMultipleChoiceAnswer();
                    q.CommunityAnswers.MultipleChoice[a.Id].Alpha = a.Alpha; 
                }
            }
        }

        for (var i = 0; i < onlineQuestions.length; ++i)
        {
            var question = questions.find(function (q)
            {
                return q.Id == onlineQuestions[i].QuestionId;
            });
            if (!question)
            {
                continue;
            }
            if (question.CommunityAnswers.MultipleChoice[onlineQuestions[i].Answer])
            {
                question.CommunityAnswers.MultipleChoice[onlineQuestions[i].Answer].push(onlineQuestions[i].UserId);
            }
            else
            {
                question.CommunityAnswers.push({User: onlineQuestions[i].UserId, Answer: onlineQuestions[i].Answer});   
            }
        }

        for (var q of questions)
        {
            q.UpdateCommunityAnswersHtml();
            var ans = q.GetUserAnswer();
            if (ans != "")
            {
                await q.SendUserAnswer(ans);
            }
        }

        console.log(HanoiCollabGlobals.Questions);
    });

    connection.on("ReceiveAnswer", function(onlineQuestion)
    {
        var question = questions.find(function (q)
        {
            return q.Id == onlineQuestion.QuestionId;
        });

        if (!question)
        {
            return;
        }

        if (onlineQuestion.OldAnswer)
        {
            if (question.CommunityAnswers.MultipleChoice[onlineQuestion.OldAnswer])
            {
                var arr = question.CommunityAnswers.MultipleChoice[onlineQuestion.OldAnswer];
                arr.splice(arr.indexOf(onlineQuestion.UserId), 1);
            }
            // null answer, must delete.
            else if (!onlineQuestion.Answer)
            {
                var writtenArr = question.CommunityAnswers as CommunityAnswerInfoWritten;
                var idx = writtenArr.findIndex(function(ans){return ans?.User == onlineQuestion.UserId;});
                if (idx != -1)
                {
                    writtenArr.splice(idx, 1);
                }
            }
        }
        if (question.CommunityAnswers.MultipleChoice[onlineQuestion.Answer])
        {
            question.CommunityAnswers.MultipleChoice[onlineQuestion.Answer].push(onlineQuestion.UserId);
            var idx = question.CommunityAnswers.findIndex(function (ans){return ans?.User == onlineQuestion.UserId;});
            if (idx != -1)
            {
                question.CommunityAnswers.splice(idx, 1);
            }
        }
        // Prevent null answers, which are actually deletions.
        else if (onlineQuestion.Answer)
        {
            var writtenArr = question.CommunityAnswers as CommunityAnswerInfoWritten;
            var idx = writtenArr.findIndex(function(ans){return ans.User == onlineQuestion.UserId;});
            if (idx != -1)
            {
                writtenArr[idx].Answer = onlineQuestion.Answer;
            }
            else
            {
                question.CommunityAnswers.push({User: onlineQuestion.UserId, Answer: onlineQuestion.Answer});
            }
        }

        question.UpdateCommunityAnswersHtml();
    });

    connection.on("RequestExamLayout", function(examId)
    {
        if (examId === HanoiCollabGlobals.ProviderFunctions.GetFormId())
        {
            connection.invoke("BroadcastExamLayout", examId, new ExamLayout());
        }
    });

    await connection.start();

    await connection.invoke("JoinExam", HanoiCollabGlobals.ProviderFunctions.GetFormId());

    connection.DeliberateClose = false;

    connection.onclose(function()
    {
        if (connection.DeliberateClose)
        {
            return;
        }
        console.log("Reconnecting...");
        var handle = setInterval(async function()
        {
            await connection.start();
            await HanoiCollabGlobals.ExamConnection?.invoke("JoinExam", HanoiCollabGlobals.ProviderFunctions.GetFormId());
            clearInterval(handle);
        }, 5000);
    });

    return connection;
}

async function TerminateExamConnection()
{
    if (HanoiCollabGlobals.ExamConnection)
    {
        await HanoiCollabGlobals.ExamConnection.invoke("LeaveExam", HanoiCollabGlobals.ProviderFunctions.GetFormId());
        HanoiCollabGlobals.ExamConnection.DeliberateClose = true;
        await HanoiCollabGlobals.ExamConnection.stop();
        HanoiCollabGlobals.ExamConnection = null;
    }
}

export { SetupExamConnection, TerminateExamConnection };