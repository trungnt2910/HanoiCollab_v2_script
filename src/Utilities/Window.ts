import { HanoiCollabExposedVariables } from "../Data/HanoiCollabExposedVariables";

declare global 
{  
    interface Window
    {
        HanoiCollabExposedVariables: HanoiCollabExposedVariables;
        FB_PUBLIC_LOAD_DATA_: any;
    }
}

window.HanoiCollabExposedVariables = new HanoiCollabExposedVariables();

export {};  