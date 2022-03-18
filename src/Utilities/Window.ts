import { HanoiCollabExposedVariables } from "../Data/HanoiCollabExposedVariables";

declare global 
{  
    interface Window
    {
        HanoiCollabExposedVariables: HanoiCollabExposedVariables;

        // Somehow TypeScript lacks this function.
        eval(code: string): any;

        // Snackbar
        SnackBar(options: {
            message?: string, 
            dismissible?: boolean,
            timeout?: number | boolean,
            status?: string,
            actions?: Array<{
                text: string;
                function?: () => void;
                dismiss?: boolean;
            }>,
            fixed?: boolean,
            position?: string,
            container?: Node | string,
            width?: string,
            speed?: string | number,
            icon?: string 
        }): any;

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