import { HanoiCollabExposedVariables } from "../Data/HanoiCollabExposedVariables";

declare global 
{  
    interface Window
    {
        HanoiCollabExposedVariables: HanoiCollabExposedVariables;

        // Google Forms
        FB_PUBLIC_LOAD_DATA_: any;

        // Dumb Hanoi Study
        ExamId: number | undefined;
        html2canvas: (elem: HTMLElement, options: any) => Promise<HTMLCanvasElement>;
        localSaveResultKey: string;
        testResultLocalObject: Array<{QuestionId: string, AnswerId: string}> | undefined;
        ShowFullScreen: any;
        LogEvent: any;
    }
}

window.HanoiCollabExposedVariables = new HanoiCollabExposedVariables();

export {};  