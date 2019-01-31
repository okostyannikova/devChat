import React, { Component } from "react";
import PropTypes from "prop-types";
import { Grid, Header, Icon, Dropdown, Image } from "semantic-ui-react";
import firebase from "../../firebase";

class UserPanel extends Component {
  state = {
    user: this.props.currentUser
  };

  dropdownOptions = () => {
    const { user } = this.state;
    return [
      {
        key: "user",
        text: (
          <span>
            Signed in as <strong>{user && user.displayName}</strong>
          </span>
        ),
        disabled: true
      },
      {
        key: "avatar",
        text: <span>Change avatar</span>
      },
      {
        key: "signout",
        text: <span onClick={this.handleSignout}>Sign Out</span>
      }
    ];
  };

  handleSignout = () => {
    firebase
      .auth()
      .signOut()
  };

  render() {
    const { user } = this.state;
    return (
      <Grid style={{ background: "#4c3c4c" }}>
        <Grid.Column>
          <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
            <Header inverted floated="left" as="h2">
              <Icon name="code" />
              <Header.Content>DevChat</Header.Content>
            </Header>
            <Header style={{ padding: "0.25em" }} as="h4" inverted>
              <Dropdown
                trigger={
                  <span>
                    <Image src={user.photoURL} spaced="right" avatar />
                    {user && user.displayName}
                  </span>
                }
                options={this.dropdownOptions()}
              />
            </Header>
          </Grid.Row>
        </Grid.Column>
      </Grid>
    );
  }
}

UserPanel.propTypes = {
  currentUser: PropTypes.object
};

export default UserPanel;
