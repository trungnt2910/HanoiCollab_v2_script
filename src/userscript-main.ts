// ==UserScript==
// @name         HanoiCollab_v2
// @namespace    https://trungnt2910.github.io/
// @version      0.2.0
// @description  HanoiCollab client for Second Generation HanoiCollab server
// @author       trungnt2910
// @license      MIT
// @icon         https://www.google.com/s2/favicons?domain=edu.vn
// @downloadURL  https://raw.githubusercontent.com/trungnt2910/HanoiCollab_v2/master/Clients/HanoiCollab_v2.user.js
// @updateURL    https://raw.githubusercontent.com/trungnt2910/HanoiCollab_v2/master/Clients/HanoiCollab_v2.meta.js
// @connect      *
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/6.0.2/signalr.min.js
// @match        https://forms.office.com/Pages/ResponsePage.aspx?*
// @match        https://shub.edu.vn/*
// @match        https://azota.vn/*
// @match        https://quilgo.com/*
// @match        https://docs.google.com/forms/*
// @match        https://study.hanoi.edu.vn/lam-bai/*
// ==/UserScript==

import { HanoiCollabGlobals } from "./Data/HanoiCollabGlobals";
import { ToFormProviderType } from "./Forms/FormProviderType";
import { SetupChatConnection, SetupChatUserInterface, TerminateChatConnection } from "./UI/Chat";
import { SetupExamConnection, TerminateExamConnection } from "./UI/Exam";
import { SetupKeyBindings } from "./UI/KeyBindings";
import { SetupIdentity } from "./UI/Login";
import { SetupSandbox } from "./UI/Sandbox";
import { SetupServer } from "./UI/Server";
import { SetupStealthMode } from "./UI/StealthMode";
import { SetupStyles } from "./UI/Styles";
import { SetupTaskbar } from "./UI/Taskbar";
import { SetupTrackingPrevention } from "./UI/TrackingPrevention";

import "./Utilities/Document";

async function Main()
{
    if (window.location.origin.startsWith("blob"))
    {
        return;
    }

    HanoiCollabGlobals.Provider = ToFormProviderType(location.hostname);
    HanoiCollabGlobals.Channel = location.href;

    await document.waitForReady();

    var oldPushState = window.history.pushState;
    window.history.pushState = function(state, title, url)
    {
        if (url)
        {
            // Should never return, page reloaded.
            window.location.href = url.toString();
        }
        oldPushState(state, title, url);
    }

    await SetupSandbox();

    // We had a nice time implementing this, however, this function still have 
    // some problems:
    // - A loop of the snapshot seems really suspicious when the student doesn't move during the test.
    // The teacher might accuse the student of using a virtual background.
    // - A loop of the screenshot is way more suspicious: The clock does not tick if the screenshot 
    // is looped.
    // Therefore, the recommended way to disable Quilgo tracking is using OBS studio (or any virtual camera provider)
    // _and_ using HanoiCollab's website for collaboration.
    if (HanoiCollabGlobals.EnableTrackingPrevention)
    {
        SetupTrackingPrevention();
    }
    
    await SetupStealthMode();
    SetupKeyBindings();
    SetupStyles();
    SetupTaskbar();

    await SetupServer();
    await SetupIdentity();

    await SetupChatConnection();
    await SetupChatUserInterface();

    var isTest = await HanoiCollabGlobals.ProviderFunctions.WaitForTestReady();

    HanoiCollabGlobals.OnIdentityChange = async function()
    {
        await TerminateChatConnection();
        await SetupChatConnection();
        await SetupChatUserInterface();
        if (isTest)
        {
            await TerminateExamConnection();
            await SetupExamConnection();    
        }
    }
    if (isTest)
    {
        HanoiCollabGlobals.Questions = HanoiCollabGlobals.ProviderFunctions.GetQuestionInfos();
        HanoiCollabGlobals.ProviderFunctions.SetupElementHooks();
        await SetupExamConnection();
        HanoiCollabGlobals.ProviderFunctions.SetupCommunityAnswersUI();
    }
    window.addEventListener("beforeunload", async function() 
    {
        await TerminateChatConnection();
        await TerminateExamConnection();
    });
}

Main();