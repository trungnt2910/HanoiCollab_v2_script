import { HanoiCollabGlobals } from "../Data/HanoiCollabGlobals";

function GetImageResource(name: string): string
{
    return HanoiCollabGlobals.DistributionRoot + "/Images/" + name;
}

export { GetImageResource };