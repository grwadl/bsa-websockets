import {changeReadyStatus} from "../../views/user.mjs";

export const changeStateHandler = ({username, isReady}) => changeReadyStatus({username, ready: isReady})
