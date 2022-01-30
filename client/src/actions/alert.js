import { v4 as uuid } from 'uuid';
import { SET_ALERT, REMOVE_ALERT } from './types';

// Action creator
export const setAlert =
    (msg, alertType, timeout = 5000) =>
    (dispatch) => {
        const id = uuid();

        // Dispatch an action
        dispatch({
            type: SET_ALERT,
            payload: { id, msg, alertType },
        });

        setTimeout(
            () => dispatch({ type: REMOVE_ALERT, payload: id }),
            timeout
        );
    };
