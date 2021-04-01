import React, {useState, useEffect} from 'react'
import './Header.css'
import Post from './Post'
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import { Input } from '@material-ui/core';
import firebase from 'firebase';
import {storage, db, auth} from './firebase';

function getModalStyle(){
    const top = 50;
    const left = 50;
  
    return{
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`
    };
  }
  
  const useStyles = makeStyles((theme) => ({
    paper: {
      position: 'absolute',
      width: 400,
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3)
    },
  }));

function Header({user}) {

    const classes = useStyles()
    const [modalStyle] = useState(getModalStyle)
    const [open, setOpen] = useState(false)
    const [openProfile, setOpenProfile] = useState(false)

    const [image, setImage] = useState(null)
    const [caption, setCaption] = useState('')
    const [feeds, setFeeds] = useState([])
    const [userData, setuserData] = useState({})

    useEffect(() => {

        db.collection("posts").orderBy('timestamp', 'desc').onSnapshot(snapshot => {
          setFeeds(snapshot.docs.map(doc => ({
            id: doc.id,
            feed: doc.data()
          })));
        })
    
    }, []);

    useEffect(() => {
        db.collection("users").doc(user.uid).get().then(doc => {
            setuserData(doc.data())
        })
    }, [feeds])

    const handleChange = (e) => {
        if(e.target.files[0]){
            setImage(e.target.files[0])   
        }
    }

    const handleLogout = (e) => {
        e.preventDefault()
        if(window.confirm("Sure to Log out")){
            auth.signOut()
        }
    }

    const handleUpload = (e) => {
        e.preventDefault()
        if(image){
        
          const uploadTask = storage.ref(`images/${image.name}`).put(image)
    
          uploadTask.on(
              "state_changed",
              (snapshot) => {
                  // progress function...
                  const progress = Math.round(
                      (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                  )
                  
              },
              (error) => {
                  // error function...
                  console.log(error)
                  alert(error.message)
              },
              () => {
                  // complete function...
                  storage
                  .ref("images")
                  .child(image.name)
                  .getDownloadURL()
                  .then(url => {
                      // post image inside db
                      db.collection("posts").add({
                          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                          caption: caption,
                          image: url,
                          name: userData.username,
                          profileImage: userData.profileImage
                      })

                      setCaption('')
                      setImage(null)
                      setOpen(false)
    
                  })
              }
          )
        }
        else{
          alert("select a file.")
          setCaption('')
        }
    }

    return (
        <div>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
            >
                <div style={modalStyle} className={classes.paper}>
                <form className="modal__form">
                    
                    <label htmlFor="modal__formImage" className="modal__formImageLabel">Select picture</label>
                    <input id="modal__formImage" className="modal__formImage" type="file" onChange={handleChange} />

                    <Input
                        className="modal__formCaption"
                        type="text"
                        placeholder="caption here..."
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)} 
                    />

                    <button
                        className="modal__formSubmit"
                        type="submit"
                        onClick={handleUpload}
                    >Post
                    </button>
                </form>
                </div>
            </Modal>

            <Modal
                open={openProfile}
                onClose={() => setOpenProfile(false)}
            >
                {   
                    userData ?
                    <div style={modalStyle} className={classes.paper}>
                        <div className="modalProfile">
                            <img
                                src={userData.profileImage}
                                alt="profile image"
                                className="modalProfile__image"
                            />

                            <h2 className="modalProfile__username">{userData.username}</h2>

                            <p className="modalProfile__bio">{userData.bio}</p>
                            <p className="modalProfile__email">email : {userData.email}</p>
                        </div>
                    </div>
                    : null
                }
            </Modal>

            <div className="header" name="top">
                <a href="#top" >
                    <img
                        src="images/instagram-logo-1.png"
                        alt=""
                        className="header__image"
                    />
                </a>
                <form>
                    <img
                        src="images/user.svg"
                        alt="view profile"
                        className="header__viewProfile"
                        title="view profile"
                        onClick={() => setOpenProfile(true)}
                    />
                    <input
                        type="submit"
                        className="header__addPost"
                        value="add post"
                        onClick={(e) =>{
                            e.preventDefault()
                            setOpen(true)
                        }}
                    />
                    <input
                        type="submit"
                        className="header__logOut"
                        value="Log out"
                        onClick={handleLogout}
                    />
                </form>
            </div>
            <div>
                {
                    userData ?
                    feeds.map(({id, feed}) => (
                        <Post key={id} postId={id} postImage={feed.image} caption={feed.caption} uName={feed.name} profileImage={feed.profileImage} whoCommented={userData.username}/>
                    ))
                    : <h2 className="loading">loading...</h2>
        
                }
            </div>
        </div>
    )
}

export default Header
