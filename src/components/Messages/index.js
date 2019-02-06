import React, { Component } from "react";
import PropTypes from "prop-types";
import firebase from "../../firebase";
import debounce from "lodash.debounce";
import { Segment, Comment } from "semantic-ui-react";

import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";

class Messages extends Component {
  constructor(props) {
    super(props);
    this.messagesRef = firebase.database().ref("messages");
    this.privateMessagesRef = firebase.database().ref("privateMessages");

    this.state = {
      messages: [],
      messagesLoading: true,
      numUniqueUsers: "",
      searchTerm: "",
      searchLoading: false,
      searchResults: [],
    };
  }

  componentDidMount() {
    const { currentChannel, user } = this.props;

    if (currentChannel && user) {
      this.addListeners(currentChannel.id);
    }
  }

  addListeners = channelId => {
    this.addMessageListener(channelId);
  };

  addMessageListener = channelId => {
    const loadedMessages = [];
    const ref = this.getMessagesRef();

    ref.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());

      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      });
      this.countUniqueUsers(loadedMessages);
    }, err => console.log(err));
  };

  getMessagesRef = () => {
    const { isPrivateChannel } = this.props;
    return isPrivateChannel ? this.privateMessagesRef : this.messagesRef;
  };

  handleSearchChange = debounce(event => {
    const { value } = event.target;
    this.setState(
      {
        searchTerm: value,
        searchLoading: true
      },
      () => this.handleSearchMessages()
    );
  }, 300);

  handleSearchMessages = () => {
    const { messages, searchTerm } = this.state;
    const channelMessages = [...messages];
    const regex = new RegExp(searchTerm, "gi");
    const searchResults = channelMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResults });
    setTimeout(() => this.setState({ searchLoading: false }), 1000);
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

  displayChannelName = channel => {
    const { isPrivateChannel } = this.props;
    return channel ? `${isPrivateChannel ? "@" : "#"}${channel.name}` : "";
  };

  render() {
    const { currentChannel, user, isPrivateChannel } = this.props;
    const {
      messages,
      numUniqueUsers,
      searchResults,
      searchTerm,
      searchLoading
    } = this.state;
    return (
      <React.Fragment>
        <MessagesHeader
          channelName={this.displayChannelName(currentChannel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={isPrivateChannel}
        />

        <Segment>
          <Comment.Group className="messages">
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
          </Comment.Group>
        </Segment>

        <MessageForm
          currentChannel={currentChannel}
          user={user}
          isPrivateChannel={isPrivateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </React.Fragment>
    );
  }
}

Messages.propTypes = {
  currentChannel: PropTypes.object,
  user: PropTypes.object,
  isPrivateChannel: PropTypes.bool
};

export default Messages;
