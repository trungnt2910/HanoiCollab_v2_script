function PatchLocation(elem: Element)
{
    if (!elem.getAttribute)
    {
        return;
    }
    var src = elem.getAttribute("src");
    var href = elem.getAttribute("href");
    if (href)
    {
        if (!href.startsWith("http"))
        {
            elem.setAttribute("href", location.origin + href);
        }  
    }
    if (src)
    {
        if (src.startsWith("blob") || src.startsWith("data"))
        {
            return;
        }
        if (!src.startsWith("http"))
        {
            // Sus.
            if (src.startsWith("//"))
            {
                elem.setAttribute("src", "https:" + src);
                elem.setAttribute("originalSrc", src);
            }
            else
            {
                elem.setAttribute("src", location.origin + src);
                elem.setAttribute("originalSrc", src);    
            }
        }  
    }
}

export { PatchLocation };