class Html
{
    static createElement(html: string) : HTMLElement
    {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        return (doc.body.firstChild ?? doc.head.firstChild) as HTMLElement;
    }
}

export { Html };