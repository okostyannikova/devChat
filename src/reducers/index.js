import { combineReducers } from "redux";
import * as actionTypes from "../actions/types";

const initialState = {
  isLoading: true
};

export const userReduser = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.SET_USER:
      return {
        currentUser: payload.currentUser,
        isLoading: false
      };
    case actionTypes.CLEAR_USER:
      return {
        ...initialState,
        isLoading: false
      };

    default:
      return state;
  }
};

const rootReduser = combineReducers({
  user: userReduser
});

export default rootReduser;
