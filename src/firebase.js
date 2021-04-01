import firebase from 'firebase'

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyCost9zHfxVVXCPUka-F3RdH-gLu54k0VQ",
    authDomain: "instagram-byme.firebaseapp.com",
    projectId: "instagram-byme",
    storageBucket: "instagram-byme.appspot.com",
    messagingSenderId: "250535364408",
    appId: "1:250535364408:web:7519e385f5e2f1642663cd",
    measurementId: "G-FT62E4CV49"
  })

  const db = firebaseApp.firestore()
  const storage = firebase.storage()
  const auth = firebase.auth()

  export {db, storage, auth}