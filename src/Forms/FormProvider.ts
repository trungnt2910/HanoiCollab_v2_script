import { QuestionLayout } from "../Data/ExamLayout";
import { QuestionInfo } from "../Data/QuestionInfo";
import { FormProviderType } from "./FormProviderType";

class FormProvider
{
    constructor()
    {

    }

    // Functions
    PatchScript(src: string, code: string): string
    {
        return code;
    }

    PatchElement(element: Element): void
    {

    }

    WaitForTestReady(): Promise<boolean>
    {
        return Promise.resolve(false);
    }

    SetupElementHooks()
    {

    }

    SetupCommunityAnswersUI()
    {
        throw new Error("Not implemented");
    }

    FocusQuestion(q: QuestionInfo)
    {
        q.HtmlElement.scrollIntoView();
    }

    // Properties
    GetType() : FormProviderType
    {
        return FormProviderType.None;
    }

    DisableSandbox() : boolean
    {
        return false;
    }

    ChildProviders(): FormProviderType[]
    {
        return [];
    }

    GetFormId(): string
    {
        throw new Error("Not implemented");
    }

    ExtractResources(): string[]
    {
        return [];
    }

    ExtractQuestions(): QuestionLayout[]
    {
        return [];
    }

    GetQuestionInfos(): QuestionInfo[]
    {
        return [];
    }
}

export { FormProvider };