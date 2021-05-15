import IData from "./IData";

export default interface IStreamData extends IData {
    IsEnd: boolean;
    Replace: boolean;
    UntilConnected: Promise<void>;
}

