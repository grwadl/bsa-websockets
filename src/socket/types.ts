export interface IMember {
    username: string,
    isReady: boolean,
    percent: number,
}

export interface IRoom {
    name: string,
    members: IMember[],
    winners?: IMember[],
    chosedId: number | boolean,
    isHidden: boolean
}