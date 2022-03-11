declare global 
{  
    interface Document
    {
        waitForReady(): Promise<void>;
    }
}  

Document.prototype.waitForReady = function(): Promise<void>
{
    return new Promise((resolve) =>
    {
        document.addEventListener("readystatechange", function()
        {
            if (document.readyState === 'complete')
            {
                resolve();
            }    
        });
        if (document.readyState === 'complete')
        {
            resolve();
        }
    });
}

export {};  