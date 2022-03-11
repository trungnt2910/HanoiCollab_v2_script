async function Download(url: string) : Promise<GM_Types.XHRResponse<unknown>>
{
    return await new Promise(function (resolve)
    {
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            onload: function(r)
            {
                resolve(r);
            },
            onerror: function(r)
            {
                resolve(r);
            }
        });
    });
}

export { Download };