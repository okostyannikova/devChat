import * as actionTypes from "./types";

/* User actions */
export const setUser = user => ({
  type: actionTypes.SET_USER,
  payload: { currentUser: user }
});

export const clearUser = () => ({
  type: actionTypes.CLEAR_USER
});

/* Channel actions */
export const setCurrentChannel = channel => ({
  type: actionTypes.SET_CURRENT_CHANNEL,
  payload: { currentChannel: channel }
});

export const setPrivateChannel = isPrivateChannel => ({
  type: actionTypes.SET_PRIVATE_CHANNEL,
  payload: { isPrivateChannel }
});

export const setUserPosts = userPosts => ({
  type: actionTypes.SET_USER_POSTS,
  payload: { userPosts }
});

/* Colors Actions */
export const setColors = (primaryColor, secondaryColor) => ({
  type: actionTypes.SET_COLORS,
  payload: { primaryColor, secondaryColor }
});
