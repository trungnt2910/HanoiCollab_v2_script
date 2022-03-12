enum FormProviderType
{
    None = "",
    GoogleDocs = "docs.google.com",
    Quilgo = "quilgo.com",
    Shub = "shub.edu.vn",
    Azota = "azota.vn",
    MicrosoftForms = "forms.office.com",
    HanoiStudy = "study.hanoi.edu.vn",
}

function ToFormProviderType(str: string): FormProviderType
{
    switch (str)
    {
        case "azota.vn":
            return FormProviderType.Azota;
        case "docs.google.com":
            return FormProviderType.GoogleDocs;
        case "forms.office.com":
            return FormProviderType.MicrosoftForms;
        case "quilgo.com":
            return FormProviderType.Quilgo;
        case "shub.edu.vn":
            return FormProviderType.Shub;
        case "study.hanoi.edu.vn":
            return FormProviderType.HanoiStudy;
        default:
            return FormProviderType.None;
    }
} 

export { FormProviderType, ToFormProviderType };