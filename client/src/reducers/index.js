import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth';

// Combine the reducers
export default combineReducers({
    alert,
    auth,
});
