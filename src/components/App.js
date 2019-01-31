import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import "./App.css";
import { Grid } from "semantic-ui-react";
import ColorPanel from "./ColorPanel";
import SidePanel from "./SidePanel";
import Messages from "./Messages";
import MetaPanel from "./MetaPanel";

const App = ({ currentUser }) => {
  return (
    <Grid columns="equal" className="app" style={{ background: "#eee" }}>
      <ColorPanel />
      <SidePanel currentUser={currentUser} />

      <Grid.Column style={{ marginLeft: 320 }}>
        <Messages />
      </Grid.Column>

      <Grid.Column width={4}>
        <MetaPanel />
      </Grid.Column>
    </Grid>
  );
};

App.propTypes = {
  //from connect
  currentUser: PropTypes.object
};

const mapStateToProps = state => ({
  currentUser: state.user.currentUser
});

export default connect(mapStateToProps)(App);
