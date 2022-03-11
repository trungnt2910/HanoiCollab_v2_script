import { AzotaFormProvider } from "./AzotaFormProvider";
import { FormProvider } from "./FormProvider";
import { FormProviderType } from "./FormProviderType";
import { GoogleDocsFormProvider } from "./GoogleDocsFormProvider";
import { MicrosoftFormsFormProvider } from "./MicrosoftFormsFormProvider";
import { QuilgoFormProvider } from "./QuilgoFormProvider";
import { ShubFormProvider } from "./ShubFormProvider";

class FormProviderFactory
{
    static Create(): FormProvider
    {
        switch (window.location.hostname)
        {
            case FormProviderType.Azota:
                return new AzotaFormProvider();
            case FormProviderType.GoogleDocs:
                return new GoogleDocsFormProvider();
            case FormProviderType.MicrosoftForms:
                return new MicrosoftFormsFormProvider();
            case FormProviderType.Quilgo:
                return new QuilgoFormProvider();
            case FormProviderType.Shub:
                return new ShubFormProvider();
            default:
                return new FormProvider();
        }
    }
}

export { FormProviderFactory };