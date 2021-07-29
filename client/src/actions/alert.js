import uuid from 'uuid';
import { SET_ALERT, REMOVE_ALERT } from './types';

// Action creator
export const setAlert = (msg, alertType) => (dispatch) => {
    const id = uuid.v4();

    // Dispatch an action
    dispatch({
        type: SET_ALERT,
        payload: { id, msg, alertType },
    });
};
