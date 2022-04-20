import { GUID } from "../Utilities/Guid"
import { FormProviderType } from "../Forms/FormProviderType";
import { FormProvider } from "../Forms/FormProvider";
import { HanoiCollabConnection } from "./HanoiCollabConnection";
import { QuestionInfo } from "./QuestionInfo";
import { FormProviderFactory } from "../Forms/FormProviderFactory";

class HanoiCollabGlobalType
{
    readonly WindowId: string;

    // === SCRIPT INFO ===
    readonly Version: string = GM_info.script.version;
    readonly StableDownload: string = "https://raw.githubusercontent.com/trungnt2910/HanoiCollab_v2/master/Clients/HanoiCollab_v2.user.js";
    readonly BetaDownload: string = "https://raw.githubusercontent.com/trungnt2910/HanoiCollab_v2_script/dist/HanoiCollab_v2.user.js";
    readonly DiscordServer: string = "https://discord.gg/tDsux9HWPr";
    readonly GithubRepo: string = "https://github.com/trungnt2910/HanoiCollab_v2"
    readonly DistributionRoot: string = "https://raw.githubusercontent.com/trungnt2910/HanoiCollab_v2_script/dist";

    // === SETTINGS ===
    EnableTrackingPrevention: boolean;
    StealthModeConfig: IDictionary<boolean>;
    Server: string;
    Identity: IIdentity | null;
    ActiveUsername: string | null;

    // === GENERAL INFO ===
    // The naming is stupid, yes, but we're dealing with a lot
    // of legacy code here.
    Provider: FormProviderType;
    Channel: string;

    // === SANDBOXED ENVIRONMENT ===
    Document: Document;
    Window: Window;

    // === UTILITIES === 
    ProviderFunctions: FormProvider;

    // === TRACKING ===
    AlwaysBlockImage: IDictionary<boolean>;
    AlwaysSendImage: IDictionary<boolean>;
    LoopImage: IDictionary<string>;

    // === POPUP ===
    NoticePopupPromise: Promise<string> | null;
    IsStealthMode: boolean;
    LoginPopupPromise: Promise<IIdentity> | null;

    // === CONNECTIONS ===
    ChatConnection: HanoiCollabConnection | null;
    ExamConnection: HanoiCollabConnection | null;

    // === EVENTS ===
    OnIdentityChange: (identity: IIdentity) => void;

    // === EXAMS ===
    Questions: QuestionInfo[];

    constructor()
    {
        this.WindowId = GUID();
        
        this.EnableTrackingPrevention = false;
        this.StealthModeConfig = {};
        this.Server = "";
        this.Identity = null;
        this.ActiveUsername = null;

        this.Channel = "";
        this.Provider = FormProviderType.None;

        this.Document = document;
        this.Window = unsafeWindow;

        this.ProviderFunctions = FormProviderFactory.Create();

        this.AlwaysBlockImage = {};
        this.AlwaysSendImage = {};
        this.LoopImage = {};

        this.NoticePopupPromise = null;
        this.IsStealthMode = false;
        this.LoginPopupPromise = null;

        this.ChatConnection = null;
        this.ExamConnection = null;

        this.OnIdentityChange = () => {};

        this.Questions = [];
    }
}

const HanoiCollabGlobals = new HanoiCollabGlobalType();

FormProvider.prototype.SetupCommunityAnswersUI = function()
{
    for (var q of HanoiCollabGlobals.Questions)
    {
        q.HtmlElement.appendChild(q.CommunityAnswersHtml);
    }
}

export { HanoiCollabGlobals };