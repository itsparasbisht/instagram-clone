import React, {useState, useEffect} from 'react'
import './SignIn.css'
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import { Input } from '@material-ui/core';
import {storage, db, auth} from './firebase';
import Header from './Header';

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
      border: '1px solid rgb(212, 212, 212)',
      borderRadius: 10,
      outline: 'none',
      fontFamily: 'poppins',
      padding: theme.spacing(2, 4, 3),
    },
  }));

function SignIn() {

    const classes = useStyles()
    const [modalStyle] = useState(getModalStyle)
    const [open, setOpen] = useState(false)

    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [profileImg, setProfileImg] = useState(null)
    const [bio, setBio] = useState('')
    const [user, setUser] = useState()

    const handleChange = (e) => {
        if(e.target.files){
            setProfileImg(e.target.files[0])
        }
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
          if(authUser){
            // user has logged in
            setUser(authUser)
          }
          else{
            // user has logged out
            setUser(null)
          }
        })
    
        return () => {
          unsubscribe()
        }
    }, [user])

    const createAccount = (e) => {
            e.preventDefault()
            if(profileImg){
            
              const uploadTask = storage.ref(`profileImages/${profileImg.name}`).put(profileImg)
        
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
                      .ref("profileImages")
                      .child(profileImg.name)
                      .getDownloadURL()
                      .then(url => {
                        auth.createUserWithEmailAndPassword(email, password)
                        .then(cred => {
                            db.collection('users').doc(cred.user.uid).set({
                                username: username,
                                profileImage: url,
                                bio: bio,
                                email: email
                            })
                            setUser(true)
                            setEmail('')
                            setPassword('')
                            setProfileImg(null)
                            setUsername('')
                            setBio('')
                            setOpen(false)
                        })
                        .catch(error => {
                            setEmail('')
                            setPassword('')
                            setProfileImg(null)
                            setUsername('')
                            setBio('')
                            alert(error.message)
                        })
                    })
                })
            }
            else{
              alert("select a profile image.")
            }
    }

    const handleLogin = (e) => {
        e.preventDefault()
        auth.signInWithEmailAndPassword(loginEmail, loginPassword)
        .then((cred) => {
            setUser(cred)
            setLoginEmail('')
            setLoginPassword('')
        })
        .catch(error =>{
            alert(error.message)
            setLoginEmail('')
            setLoginPassword('')
        })
    }

    return (
        <div>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
            >
                <div style={modalStyle} className={classes.paper}>
                <form className="modal__signUpForm" autoComplete="off">

                    <center>
                        <img
                            src="images/instagram-logo-1.png"
                            className="modal__signUpForm-logo"
                            alt="instagram logo"
                        />
                    </center>
                    
                    <Input
                        className="modal__signUpForm-email"
                        type="email"
                        placeholder="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                    />

                    <Input
                        className="modal__signUpForm-pwd"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                    <Input
                        className="modal__signUpForm-username"
                        type="text"
                        placeholder="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} 
                    />
                    <label
                        htmlFor="modal__signUpForm-image"
                        className="modal__signUpForm-imageLabel"
                    >
                        Select profile image
                    </label>
                    <input
                        id="modal__signUpForm-image"
                        type="file"
                        onChange={handleChange}
                    />
                    <Input
                        className="modal__signUpForm-bio"
                        type="text"
                        placeholder="Bio here..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)} 
                    />

                    <button
                        className="modal__signUpForm-submit"
                        type="submit"
                        onClick={createAccount}
                    >
                        Sign up
                    </button>
                </form>
                </div>
            </Modal>

            {
                user ? <Header user={user} /> :

                <div className="signIn__container">
                    <div className="signIn__container-image">
                        <img src="images/instagram-logo-main.svg" alt=""/>
                    </div>
                    <div className="signIn__container-form">
                        <form className="signIn__container-form1" autoComplete="off">
                            <img src="images/instagram-logo-1.png" alt=""/>
                            <input
                                type="email"
                                name="email"
                                id="signIn__container-form1Email"
                                placeholder="email..."
                                onChange={(e) => setLoginEmail(e.target.value)}
                                value={loginEmail}
                            />
                            <input
                                type="password"
                                name="password"
                                id="signIn__container-form1Pwd"
                                placeholder="Password"
                                onChange={(e) => setLoginPassword(e.target.value)}
                                value={loginPassword}
                            />
                            <input
                                type="submit"
                                name="submit"
                                id="signIn__container-form1Submit"
                                value="Log in"
                                onClick={handleLogin}
                            />
                        </form>

                        <form className="signIn__container-form2">
                            <span>Don't have an account?</span>
                            <button onClick={(e) => {
                                setOpen(true)
                                e.preventDefault()
                            }}>Sign up</button>
                        </form>
                    </div>
                </div>
            }
        </div>
    )
}

export default SignIn
