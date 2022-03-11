import { HanoiCollabGlobals } from "./HanoiCollabGlobals";

class QuestionLayout
{
    Type: string;
    Description: string;
    Id: string;
    Answers: AnswerLayout[];
    Resources: string[];
    ImageResources: string[];

    constructor(type: string, description: string, id: string, answers: AnswerLayout[], resources: string[], imageResources: string[])
    {
        this.Type = type;
        this.Description = description;
        this.Id = id;
        this.Answers = answers;
        this.Resources = resources;
        this.ImageResources = imageResources; 
    }
}

class AnswerLayout
{
    Description: string;
    Id: string;
    Alpha: string;
    Resources: string[];
    ImageResources: string[];

    constructor(description: string, resources: string[], id: string, alpha: string, imageResources: string[])
    {
        this.Description = description;
        this.Resources = resources;
        this.Id = id;
        this.Alpha = alpha;
        this.ImageResources = imageResources;
    }
}

class ExamLayout
{
    OriginalLink: string;
    Resources: string[];
    Questions: QuestionLayout[];

    constructor()
    {
        this.OriginalLink = window.location.href;
        this.Resources = HanoiCollabGlobals.ProviderFunctions.ExtractResources();
        this.Questions = HanoiCollabGlobals.ProviderFunctions.ExtractQuestions();
    }
}

export { ExamLayout, QuestionLayout, AnswerLayout };