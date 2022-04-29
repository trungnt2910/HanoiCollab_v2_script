import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";

function GetResource(name: string): string
{
    return `${HanoiCollabGlobals.DistributionRoot}/${name}`;
}

function GetImageResource(name: string): string
{
    return HanoiCollabGlobals.DistributionRoot + "/Images/" + name;
}

export { GetResource, GetImageResource };