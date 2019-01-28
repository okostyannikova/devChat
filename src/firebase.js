import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

const config = {
  apiKey: "AIzaSyCkjltbXPk_xTvZ7JuE42n-aGRmKVBlpzw",
  authDomain: "react-slack-clone-2a3da.firebaseapp.com",
  databaseURL: "https://react-slack-clone-2a3da.firebaseio.com",
  projectId: "react-slack-clone-2a3da",
  storageBucket: "react-slack-clone-2a3da.appspot.com",
  messagingSenderId: "267995964918"
};

firebase.initializeApp(config);

export default firebase;