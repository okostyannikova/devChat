import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import { Menu, Icon, Modal, Form, Input, Button } from "semantic-ui-react";
import firebase from "../../firebase";

class Channels extends Component {
  state = {
    user: this.props.currentUser,
    channels: [],
    activeChannel: "",
    modal: false,
    channelName: "",
    channelDetails: "",
    channelsRef: firebase.database().ref("channels"),
    firstLoad: true
  };

  componentDidMount = () => {
    this.addListeners();
  };

  componentWillUnmount = () => {
    this.removeListeners();
  };

  addListeners = () => {
    const { channelsRef } = this.state;
    let loadedChannels = [];

    channelsRef.on("child_added", snap => {
      loadedChannels.push(snap.val());
      this.setState({ channels: loadedChannels }, () => this.setFirstChannel());
    });
  };

  removeListeners = () => {
    const { channelsRef } = this.state;
    channelsRef.off();
  };

  setFirstChannel = () => {
    const { channels, firstLoad } = this.state;
    const { setCurrentChannel } = this.props;
    const firstChannel = channels[0];

    if (firstLoad && channels.length > 0) {
      setCurrentChannel(firstChannel);
      this.setActiveChannel(firstChannel);
    }

    this.setState({ firstLoad: false });
  };

  addChannel = () => {
    const { channelsRef, channelName, channelDetails, user } = this.state;

    const key = channelsRef.push().key;

    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL
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
    setCurrentChannel(channel);
    setPrivateChannel(false);
  };

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
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
