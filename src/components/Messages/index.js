import React, { Component } from "react";
import PropTypes from "prop-types";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setUserPosts } from "../../actions";
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
    this.usersRef = firebase.database().ref("users");

    this.state = {
      messages: [],
      messagesLoading: true,
      isChannelStarred: false,
      numUniqueUsers: "",
      searchTerm: "",
      searchLoading: false,
      searchResults: []
    };
  }

  componentDidMount() {
    const { currentChannel, user } = this.props;

    if (currentChannel && user) {
      this.addListeners(currentChannel.id);
      this.addUserStarsListener(currentChannel.id, user.uid);
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
      this.countUserPosts(loadedMessages);
    });
  };

  addUserStarsListener = (channelId, userId) => {
    this.usersRef
      .child(userId)
      .child("starred")
      .once("value")
      .then(data => {
        if (data.val() !== null) {
          const channelIds = Object.keys(data.val());
          const prevStarred = channelIds.includes(channelId);
          this.setState({ isChannelStarred: prevStarred });
        }
      });
  };

  getMessagesRef = () => {
    const { isPrivateChannel } = this.props;
    return isPrivateChannel ? this.privateMessagesRef : this.messagesRef;
  };

  handleStar = () => {
    this.setState(
      state => ({
        isChannelStarred: !state.isChannelStarred
      }),
      () => this.starChannel()
    );
  };

  starChannel = () => {
    const {
      state: { isChannelStarred },
      props: { user, currentChannel }
    } = this;

    if (isChannelStarred) {
      this.usersRef.child(`${user.uid}/starred`).update({
        [currentChannel.id]: {
          name: currentChannel.name,
          details: currentChannel.details,
          createdBy: {
            ...currentChannel.createdBy
          }
        }
      });
    } else {
      this.usersRef
        .child(`${user.uid}/starred`)
        .child(currentChannel.id)
        .remove(err => {
          if (err !== null) {
            console.error(err);
          }
        });
    }
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

  countUserPosts = messages => {
    const { setUserPosts } = this.props;
    const userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1
        };
      }
      return acc;
    }, {});
    setUserPosts(userPosts)
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
      searchLoading,
      isChannelStarred
    } = this.state;
    return (
      <React.Fragment>
        <MessagesHeader
          channelName={this.displayChannelName(currentChannel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={isPrivateChannel}
          handleStar={this.handleStar}
          isChannelStarred={isChannelStarred}
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
  isPrivateChannel: PropTypes.bool,
  setUserPosts: PropTypes.func
};

export default connect(
  null,
  { setUserPosts }
)(Messages);
