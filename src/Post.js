import React, {useState, useEffect} from 'react'
import './Post.css'
import {db} from './firebase'
import firebase from 'firebase'

function Post({postImage, caption, profileImage, uName, postId , whoCommented}) {
    const [comment, setComment] = useState('')
    const [comments, setComments] = useState([])

    useEffect(() => {
        let unsubscribe
        if(postId){
            unsubscribe = db
            .collection("posts")
            .doc(postId)
            .collection("comments")
            .orderBy('timestamp', 'desc')
            .onSnapshot((snapshot) => {
                setComments(snapshot.docs.map((doc) => doc.data()))
            })
        }

        return () => {
            unsubscribe()
        }
    }, [postId])

    const postComment = (event) => {
        event.preventDefault()
        db.collection("posts").doc(postId).collection("comments").add({
            text: comment,
            username: whoCommented,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        setComment('')
    }

    return (
        <div className="post">

            <div className="post__container">
                <div className="post__container-header">
                    <img
                        src={profileImage}
                        alt=""
                        className="post__container-avatar"
                    />
                    <h2 className="post__container-user">{uName}</h2>
                </div>
                <img
                    src={postImage}
                    alt=""
                    className="post__container-image"
                ></img>
                <h3 className="post__container-caption">{uName} - <span>{caption}</span></h3>

                <div className="post__comments">
                    {comments.map((comment) => (
                        <p>
                            <strong>{comment.username}</strong> {comment.text}
                        </p>
                    ))}
                </div>

                <form className="post__commentBox">
                    <input
                        className="post__input"
                        type="text"
                        placeholder="add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)} 
                    />
                    <button
                        className="post__button"
                        disabled={!comment}
                        type="submit"
                        onClick={postComment}
                    >
                        Post
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Post
