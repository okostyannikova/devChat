import React, { Component } from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import firebase from "./firebase";
import * as serviceWorker from "./serviceWorker";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter
} from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import "semantic-ui-css/semantic.min.css";
import Spinner from "./components/Spinner";

import { createStore, compose } from "redux";
import { Provider, connect } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReduser from "./reducers";
import { setUser } from "./actions";

const store = createStore(rootReduser, composeWithDevTools());

class Root extends Component {
  componentDidMount = () => {
    const { history, setUser } = this.props;
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        setUser(user);
        history.push("/");
      }
    });
  };

  render() {
    const { isLoading } = this.props;
    return isLoading ? (
      <Spinner />
    ) : (
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Switch>
    );
  }
}

const mapStateToProps = state => ({
  isLoading: state.user.isLoading
});

const RootWithAuth = compose(
  withRouter,
  connect(
    mapStateToProps,
    { setUser }
  )
)(Root);

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <RootWithAuth />
    </Router>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
