import { combineReducers } from "redux";
import * as actionTypes from "../actions/types";

const initialUserState = {
  isLoading: true
};

export const userReduser = (state = initialUserState, { type, payload }) => {
  switch (type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        currentUser: payload.currentUser,
        isLoading: false
      };
    case actionTypes.CLEAR_USER:
      return {
        ...initialUserState,
        isLoading: false
      };

    default:
      return state;
  }
};

const initialChannelState = {
  currentChannel: null
};

export const channelReduser = (state = initialChannelState, { type, payload }) => {
  switch (type) {
    case actionTypes.SET_CURRENT_CHANNEL:
      return { 
        ...state, 
        currentChannel: payload.currentChannel 
      };

    default:
      return state;
  }
};

const rootReduser = combineReducers({
  user: userReduser,
  channel: channelReduser
});

export default rootReduser;
