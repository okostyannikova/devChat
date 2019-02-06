import React, { Component } from "react";
import PropTypes from "prop-types";
import { Segment, Header, Icon, Input } from "semantic-ui-react";

class MessagesHeader extends Component {
  handleChange = event => {
    event.persist();
    const { handleSearchChange } = this.props;
    handleSearchChange(event);
  };

  render() {
    const {
      channelName,
      numUniqueUsers,
      searchLoading,
      isPrivateChannel
    } = this.props;
    return (
      <Segment clearing>
        {/* Channel Title */}
        <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
          <span>
            {channelName}
            {!isPrivateChannel && <Icon name="star outline" color="black" />}
          </span>
          <Header.Subheader> {numUniqueUsers}</Header.Subheader>
        </Header>

        {/*  Channel Search Input */}
        <Header floated="right">
          <Input
            onChange={this.handleChange}
            loading={searchLoading}
            size="mini"
            icon="search"
            name="serchTerm"
            placeholder="Search Messages"
          />
        </Header>
      </Segment>
    );
  }
}

MessagesHeader.propTypes = {
  channelName: PropTypes.string,
  numUniqueUsers: PropTypes.string,
  handleSearchChange: PropTypes.func,
  searchLoading: PropTypes.bool,
  isPrivateChannel: PropTypes.bool
};

export default MessagesHeader;
