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
  currentChannel: null,
  isPrivateChannel: false,
  userPosts: null
};

export const channelReduser = (
  state = initialChannelState,
  { type, payload }
) => {
  switch (type) {
    case actionTypes.SET_CURRENT_CHANNEL:
      return {
        ...state,
        currentChannel: payload.currentChannel
      };
    case actionTypes.SET_PRIVATE_CHANNEL:
      return {
        ...state,
        isPrivateChannel: payload.isPrivateChannel
      };
    case actionTypes.SET_USER_POSTS:
      return {
        ...state,
        userPosts: payload.userPosts
      };

    default:
      return state;
  }
};

const initialColorsState = {
  primaryColor: "#4c3c4c",
  secondaryColor: "#eee"
};

export const colorsReduser = (state = initialColorsState, { type, payload }) => {
  switch (type) {
    case actionTypes.SET_COLORS:
      return {
        ...state,
        primaryColor: payload.primaryColor,
        secondaryColor: payload.secondaryColor
      };

    default:
      return state;
  }
};

const rootReduser = combineReducers({
  user: userReduser,
  channel: channelReduser,
  colors: colorsReduser
});

export default rootReduser;
