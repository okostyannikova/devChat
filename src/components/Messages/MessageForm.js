import React, { Component } from "react";
import PropTypes from "prop-types";
import firebase from "../../firebase";
import uuidv4 from "uuid/v4";
import { Segment, Button, Input } from "semantic-ui-react";
import FileModal from "./FileModal";

class MessageForm extends Component {
  constructor(props) {
    super(props);
    this.storageRef = firebase.storage().ref();

    this.state = {
      uploadTask: null,
      uploadState: "",
      percentUploaded: 0,
      message: "",
      loading: false,
      errors: [],
      modal: false
    };
  }

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  handleChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  createMessage = (fileUrl = null) => {
    const { message } = this.state;
    const { user } = this.props;
    const newMessage = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoURL
      }
    };

    if (fileUrl !== null) {
      newMessage.image = fileUrl;
    } else {
      newMessage.content = message;
    }

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

  uploadFile = (file, metadata) => {
    const { currentChannel, messagesRef } = this.props;
    const pathToUpload = currentChannel.id;
    const filePath = `chat/public/${uuidv4()}.jpg`;

    this.setState(
      {
        uploadState: "uploading",
        uploadTask: this.storageRef.child(filePath).put(file, metadata)
      },
      () => {
        this.state.uploadTask.on(
          "state_changed",
          snap => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.setState({ percentUploaded });
          },
          err => {
            console.log(err);
            this.setState({
              errors: this.state.errors.concat(err),
              uploadState: "error",
              uploadTask: null
            });
          },
          () => {
            const { uploadTask } = this.state;
            uploadTask.snapshot.ref
              .getDownloadURL()
              .then(downloadUrl => {
                this.sendFileMessage(downloadUrl, messagesRef, pathToUpload);
              })
              .catch(err => {
                console.log(err);
                this.setState({
                  errors: this.state.errors.concat(err),
                  uploadState: "error",
                  uploadTask: null
                });
              });
          }
        );
      }
    );
  };

  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({ uploadState: "done" });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          errors: this.state.errors.concat(err)
        });
      });
  };

  render() {
    const { errors, message, loading, modal } = this.state;

    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          value={message}
          onChange={this.handleChange}
          style={{ marginBottom: "0.7em" }}
          label={<Button icon="add" />}
          labelPosition="left"
          className={
            errors.length &&
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
            disabled={loading}
          />
          <Button
            onClick={this.openModal}
            color="teal"
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
          />
          <FileModal
            modal={modal}
            closeModal={this.closeModal}
            uploadFile={this.uploadFile}
          />
        </Button.Group>
      </Segment>
    );
  }
}

MessageForm.propTypes = {
  currentChannel: PropTypes.object,
  messagesRef: PropTypes.object,
  user: PropTypes.object
};

export default MessageForm;
