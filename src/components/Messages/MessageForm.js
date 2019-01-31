import React, { Component } from "react";
import PropTypes from "prop-types";
import firebase from "../../firebase";
import { Segment, Button, Input } from "semantic-ui-react";

class MessageForm extends Component {
  state = {
    message: "",
    user: this.props.currentUser,
    loading: false,
    errors: []
  };

  handleChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  createMessage = () => {
    const { user, message } = this.state;
    const newMessage = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoURL
      },
      content: message
    };

    return newMessage;
  };

  sendMessage = () => {
    const { messagesRef, currentChannel } = this.props;
    const { message, errors } = this.state;

    if (message) {
      this.setState({ loading: true });
      messagesRef
        .child(currentChannel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: "" });
        })
        .catch(err => {
          this.setState({ loading: false, errors: errors.concat(err) });
          throw new Error(err);
        });
    } else {
      this.setState({ errors: errors.concat({ message: "Add a message" }) });
    }
  };

  render() {
    const { errors } = this.state;

    return (
      <Segment className="message-form">
        <Input
          fluid
          name="message"
          onChange={this.handleChange}
          style={{ marginBottom: "0.7em" }}
          label={<Button icon="add" />}
          labelPosition="left"
          className={
            errors.some(error => error.message.includes("message"))
              ? "error"
              : ""
          }
          placeholder="Write your message"
        />
        <Button.Group widths="2">
          <Button
            onClick={this.sendMessage}
            color="orange"
            content="Add Reply"
            labelPosition="left"
            icon="edit"
          />
          <Button
            color="teal"
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
          />
        </Button.Group>
      </Segment>
    );
  }
}

MessageForm.propTypes = {
  currentChannel: PropTypes.object,
  messageRef: PropTypes.object,
  currentUser: PropTypes.object
};

export default MessageForm;
