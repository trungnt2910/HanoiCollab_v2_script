declare global 
{  
    interface String
    {
        getHashCode(): string;
        escapeHTML(): string;
    }
}  

String.prototype.getHashCode = function(): string
{
    var hash = 0, i, chr;
    if (this.length === 0) 
    {
        return "0";
    }
    for (i = 0; i < this.length; i++) 
    {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
};

const entityMap: IDictionary<string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
};

String.prototype.escapeHTML = function(): string
{
    return String(this).replace(/[&<>"'`=\/]/g, function (s) 
    {
        return entityMap[s];
    });
}

export {};  