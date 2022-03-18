import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";

function SetupStyles()
{
    var style = HanoiCollabGlobals.Document.createElement("style");
    style.innerText = 
    `
    *[id^="hanoicollab-"], *[class^="hanoicollab-"] {
        box-sizing:                  border-box;
        font-family:                 Segoe UI,Segoe WP,Tahoma,Arial,sans-serif;
        font-size:                   14px;
        font-stretch:                100%;
        font-style:                  normal;
        font-variant-caps:           normal;
        font-variant-east-asian:     normal;
        font-variant-ligatures:      normal;
        font-variant-numeric:        normal;
        font-weight:                 400;
        letter-spacing:              normal;
        line-height:                 1.5;
        margin:                      0;
        margin-block-start:          0px;
        margin-block-end:            0px;
        margin-inline-start:         0px;
        margin-inline-end:           0px;
        padding:                     0;
        text-size-adjust:            100%;
        user-select:                 none;
        -webkit-font-smoothing:      antialiased;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    }
    .hanoicollab-basic-container p {
        margin:                     0;
    }
    .hanoicollab-button {
        background-color:       rgba(0,127,127,0.9);
        border:                 1px solid black;
        border-radius:          1ex;
        padding:                0.5em;
        color:                  white;
        cursor:                 pointer;
        line-height:            1.5;
        text-transform:         unset !important;
    }
    .hanoicollab-section {
        margin-block-start:          0.5em;
        margin-block-end:            0.5em;
    }
    `;
    HanoiCollabGlobals.Document.body.appendChild(style);
}

export { SetupStyles };