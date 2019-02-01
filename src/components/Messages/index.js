import React, { Component } from "react";
import PropTypes from "prop-types";
import firebase from "../../firebase";
import { Segment, Comment } from "semantic-ui-react";

import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";

class Messages extends Component {
  constructor(props) {
    super(props);
    this.messagesRef = firebase.database().ref("messages");

    this.state = {
      messages: [],
      messagesLoading: true,
      numUniqueUsers: ""
    };
  }

  componentWillReceiveProps = nextProps => {
    const { currentChannel, user } = nextProps;
    if (currentChannel && user) {
      this.addListeners(currentChannel.id);
    }
  };

  addListeners = channelId => {
    this.addMessageListener(channelId);
  };

  addMessageListener = channelId => {
    const loadedMessages = [];
    this.messagesRef.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());
      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      });
      this.countUniqueUsers(loadedMessages);
    });
  };

  countUniqueUsers = messages => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);

    const numUniqueUsers = `${uniqueUsers.length} ${
      uniqueUsers.length === 1 ? "user" : "users"
    }`;
    this.setState({ numUniqueUsers });
  };

  displayMessages = messages => {
    const { user } = this.props;
    return (
      messages.length > 0 &&
      messages.map(message => (
        <Message key={message.timestamp} message={message} user={user} />
      ))
    );
  };

  displayChannelName = channel => (channel ? channel.name : "");

  render() {
    const { messagesRef } = this;
    const { currentChannel, user } = this.props;
    const { messages, numUniqueUsers } = this.state;
    return (
      <React.Fragment>
        <MessagesHeader
          channelName={this.displayChannelName(currentChannel)}
          numUniqueUsers={numUniqueUsers}
        />

        <Segment>
          <Comment.Group className="messages">
            {this.displayMessages(messages)}
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={currentChannel}
          user={user}
        />
      </React.Fragment>
    );
  }
}

Messages.propTypes = {
  currentChannel: PropTypes.object,
  user: PropTypes.object
};

export default Messages;
