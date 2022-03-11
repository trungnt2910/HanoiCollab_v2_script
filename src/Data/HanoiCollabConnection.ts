import { HubConnection } from "@microsoft/signalr";

interface IDeliberateCloseConnection
{
    DeliberateClose: boolean | null;
}

type HanoiCollabConnection = HubConnection & IDeliberateCloseConnection;

export { HanoiCollabConnection };