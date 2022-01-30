import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth';
import profile from './profile';

// Combine the reducers
export default combineReducers({
    alert,
    auth,
    profile,
});
