import React, { Component } from "react";
import PropTypes from "prop-types";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import { Menu, Icon } from "semantic-ui-react";

export class Starred extends Component {
  constructor(props) {
    super(props);
    this.usersRef = firebase.database().ref("users");

    this.state = {
      activeChannel: "",
      starredChannels: []
    };
  }

  componentDidMount = () => {
    const { currentUser } = this.props;
    if (currentUser) {
      this.addListeners(currentUser.uid);
    }
  };

  addListeners = userId => {
    this.usersRef
      .child(userId)
      .child("starred")
      .on("child_added", snap => {
        const starredChannel = { id: snap.key, ...snap.val() };
        this.setState(prevState => ({
          starredChannels: [...prevState.starredChannels, starredChannel]
        }));
      });

    this.usersRef
      .child(userId)
      .child("starred")
      .on("child_removed", snap => {
        const channelToRemove = { id: snap.key, ...snap.val() };
        const filterdChannels = this.state.starredChannels.filter(
          channel => channel.id !== channelToRemove.id
        );
        this.setState({ starredChannels: filterdChannels });
      });
  };

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };

  changeChannel = channel => {
    const { setCurrentChannel, setPrivateChannel } = this.props;
    this.setActiveChannel(channel);
    setCurrentChannel(channel);
    setPrivateChannel(false);
  };

  displayChannels = starredChannels => {
    const { activeChannel } = this.state;
    return (
      starredChannels.length > 0 &&
      starredChannels.map(channel => (
        <Menu.Item
          key={channel.id}
          onClick={() => this.changeChannel(channel)}
          name={channel.name}
          style={{ opacity: 0.7 }}
          active={channel.id === activeChannel}
        >
          # {channel.name}
        </Menu.Item>
      ))
    );
  };

  render() {
    const { starredChannels } = this.state;
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="star" /> STARRED
          </span>{" "}
          ({starredChannels.length})
        </Menu.Item>
        {this.displayChannels(starredChannels)}
      </Menu.Menu>
    );
  }
}

Starred.propTypes = {
  currentUser: PropTypes.object,
  setCurrentChannel: PropTypes.func,
  setPrivateChannel: PropTypes.func
};

export default connect(
  null,
  { setCurrentChannel, setPrivateChannel }
)(Starred);
