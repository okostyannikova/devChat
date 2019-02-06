import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import {
  Menu,
  Icon,
  Modal,
  Form,
  Input,
  Button,
  Label
} from "semantic-ui-react";
import firebase from "../../firebase";

class Channels extends Component {
  constructor(props) {
    super(props);
    this.channelsRef = firebase.database().ref("channels");
    this.messagesRef = firebase.database().ref("messages");

    this.state = {
      channel: null,
      channels: [],
      activeChannel: "",
      modal: false,
      channelName: "",
      channelDetails: "",
      firstLoad: true,
      notifications: []
    };
  }

  componentDidMount = () => {
    this.addListeners();
  };

  componentWillUnmount = () => {
    this.removeListeners();
  };

  addListeners = () => {
    const { channelsRef } = this;
    let loadedChannels = [];

    channelsRef.on("child_added", snap => {
      loadedChannels.push(snap.val());
      this.setState({ channels: loadedChannels }, () => this.setFirstChannel());
      this.addNotificationListener(snap.key);
    });
  };

  addNotificationListener = channelId => {
    this.messagesRef.child(channelId).on("value", snap => {
      const { channel, notifications } = this.state;
      if (channel) {
        this.handleNotifications(channelId, channel.id, notifications, snap);
      }
    });
  };

  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0;

    let index = notifications.findIndex(
      notification => notification.id === channelId
    );

    if (index !== -1) {
      if (channelId !== currentChannelId) {
        lastTotal = notifications[index].total;

        if (snap.numChildren() - lastTotal > 0) {
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren();
    } else {
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0
      });
    }

    this.setState({ notifications });
  };

  removeListeners = () => {
    const { channelsRef } = this;
    channelsRef.off();
  };

  setFirstChannel = () => {
    const { channels, firstLoad } = this.state;
    const { setCurrentChannel } = this.props;
    const firstChannel = channels[0];

    if (firstLoad && channels.length > 0) {
      setCurrentChannel(firstChannel);
      this.setActiveChannel(firstChannel);
      this.setState({ channel: firstChannel });
    }

    this.setState({ firstLoad: false });
  };

  addChannel = () => {
    const { channelName, channelDetails } = this.state;
    const {
      props: { currentUser },
      channelsRef
    } = this;

    const key = channelsRef.push().key;

    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: currentUser.displayName,
        avatar: currentUser.photoURL
      }
    };

    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({ channelName: "", channelDetails: "" });
        this.closeModal();
      })
      .catch(err => {
        throw new Error(err);
      });
  };

  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.addChannel();
    }
  };

  handleChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  isFormValid = ({ channelName, channelDetails }) =>
    channelName && channelDetails;

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  changeChannel = channel => {
    const { setCurrentChannel, setPrivateChannel } = this.props;
    this.setActiveChannel(channel);
    this.clearNotificatons();
    setCurrentChannel(channel);
    setPrivateChannel(false);
    this.setState({ channel });
  };

  clearNotificatons = () => {
    const { channel, notifications } = this.state;
    let index = notifications.findIndex(
      notification => notification.id === channel.id
    );

    if (index !== -1) {
      let updateNotifications = [...notifications];
      updateNotifications[index].total = notifications[index].lastKnownTotal;
      updateNotifications[index].count = 0;
      this.setState({ notifications: updateNotifications });
    }
  };

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };

  getNotificationCount = channel => {
    const { notifications } = this.state;
    let count = 0;

    notifications.forEach(notification => {
      if (notification.id === channel.id) {
        count = notification.count;
      }
    });

    if (count > 0) return count;
  };

  displayChannels = channels => {
    const { activeChannel } = this.state;
    return (
      channels.length > 0 &&
      channels.map(channel => (
        <Menu.Item
          key={channel.id}
          onClick={() => this.changeChannel(channel)}
          name={channel.name}
          style={{ opacity: 0.7 }}
          active={channel.id === activeChannel}
        >
          {this.getNotificationCount(channel) && (
            <Label color="red">{this.getNotificationCount(channel)}</Label>
          )}
          # {channel.name}
        </Menu.Item>
      ))
    );
  };

  render() {
    const { channels, modal } = this.state;
    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS
            </span>{" "}
            ({channels.length}) <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          {this.displayChannels(channels)}
        </Menu.Menu>

        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of Channel"
                  name="channelName"
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" /> Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}

Channels.propTypes = {
  currentUser: PropTypes.object,
  setCurrentChannel: PropTypes.func,
  setPrivateChannel: PropTypes.func
};

export default connect(
  null,
  { setCurrentChannel, setPrivateChannel }
)(Channels);
