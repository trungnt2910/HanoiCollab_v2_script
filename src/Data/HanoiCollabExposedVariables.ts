class HanoiCollabExposedVariables extends Array<any>
{
    // === TRACKING ===
    HanoiCollabApproveRequest: (data: any)=>Promise<void>;
    OldIntervals: IDictionary<number>;
    FormState: any;
    ExposedFiles: string[] | null;
    UpdateLocalStorage: ((obj: any)=>void) | null;

    constructor()
    {
        super();
        this.HanoiCollabApproveRequest = ()=>{return Promise.resolve();};
        this.OldIntervals = {};
        this.ExposedFiles = null;
        this.UpdateLocalStorage = null;
    }
};

export { HanoiCollabExposedVariables };