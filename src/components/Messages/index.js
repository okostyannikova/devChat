import React, { Component } from "react";
import PropTypes from "prop-types";
import firebase from "../../firebase";
import { Segment, Comment } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";

class Messages extends Component {
  state = {
    messagesRef: firebase.database().ref("messages"),
    channel: this.props.currentChannel,
    user: this.props.currentUser
  };

  render() {
    const { messagesRef, user } = this.state;
    const { currentChannel } = this.props
    return (
      <React.Fragment>
        <MessagesHeader />

        <Segment>
          <Comment.Group className="messages" />
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={currentChannel}
          currentUser={user}
        />
      </React.Fragment>
    );
  }
}

Messages.propTypes = {
  currentChannel: PropTypes.object,
  currentUser: PropTypes.object
};

export default Messages;
