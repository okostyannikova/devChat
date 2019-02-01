import React, { Component } from "react";
import PropTypes from "prop-types";
import firebase from "../../firebase";
import { Menu, Icon } from "semantic-ui-react";

export class DirectMessages extends Component {
  constructor(props) {
    super(props);
    this.usersRef = firebase.database().ref("users");
    this.connectedRef = firebase.database().ref(".info/connected");
    this.presenceRef = firebase.database().ref("presence");

    this.state = {
      users: []
    };
  }

  componentDidMount = () => {
    const { currentUser } = this.props;
    if (currentUser) {
      this.addListeners(currentUser.uid);
    }
  };

  addListeners = currentUserUid => {
    const loadedUsers = [];
    this.usersRef.on("child_added", snap => {
      if (currentUserUid !== snap.key) {
        const user = snap.val();
        user.uid = snap.key;
        user.status = "offline";
        loadedUsers.push(user);
        this.setState({ users: loadedUsers });
      }
    });

    this.connectedRef.on("value", snap => {
      if (snap.val() === true) {
        const ref = this.presenceRef.child(currentUserUid);
        ref.set(true);
        ref.onDisconnect().remove(err => {
          if (err !== null) {
            console.log(err);
          }
        });
      }
    });

    this.presenceRef.on("child_added", snap => {
      if (currentUserUid !== snap.key) {
        this.addStatusToUser(snap.key);
      }
    });

    this.presenceRef.on("child_removed", snap => {
      if (currentUserUid !== snap.key) {
        this.addStatusToUser(snap.key, false);
      }
    });
  };

  addStatusToUser = (userId, connected = true) => {
    const { users } = this.state;
    const updateUsers = users.reduce((acc, user) => {
      if (user.uid === userId) {
        user.status = `${connected ? "online" : "offlineƒ"}`;
      }
      return acc.concat(user);
    }, []);
    this.setState({ users: updateUsers });
  };

  isUserOnline = user => user.status === "online";

  render() {
    const { users } = this.state;
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="mail" /> DIRECT MESSAGES
          </span>{" "}
          ({users.length})
        </Menu.Item>
        {users.map(user => (
          <Menu.Item
            key={user.uid}
            onClick={() => console.log(user)}
            style={{ opacity: 0.7, fontStyle: "italic" }}
          >
            <Icon
              name="circle"
              color={this.isUserOnline(user) ? "green" : "red"}
            />
            @ {user.name}
          </Menu.Item>
        ))}
      </Menu.Menu>
    );
  }
}

DirectMessages.propTypes = {
  currentUser: PropTypes.object
};

export default DirectMessages;
