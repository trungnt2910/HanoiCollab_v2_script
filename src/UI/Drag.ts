import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";

function EnableDrag(elem: HTMLElement) 
{
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elem.onmousedown = DragMouseDown;
  
    function DragMouseDown(e: MouseEvent) 
    {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.screenX;
        pos4 = e.screenY;
        HanoiCollabGlobals.Document.onmouseup = DragMouseUp;
        // call a function whenever the cursor moves:
        HanoiCollabGlobals.Document.onmousemove = DragMouseMove;
    }
  
    function DragMouseMove(e: MouseEvent) 
    {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.screenX;
        pos2 = pos4 - e.screenY;
        pos3 = e.screenX;
        pos4 = e.screenY;
        elem.style.margin = "0";
        // set the element's new position:
        elem.style.top = (elem.offsetTop - pos2) + "px";
        elem.style.left = (elem.offsetLeft - pos1) + "px";
        elem.style.bottom = "";
        elem.style.right = "";
    }
  
    function DragMouseUp() 
    {
        // stop moving when mouse button is released:
        HanoiCollabGlobals.Document.onmouseup = null;
        HanoiCollabGlobals.Document.onmousemove = null;
    }
}

export { EnableDrag };