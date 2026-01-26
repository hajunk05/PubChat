const PubChat = ({ user }) => {
    return (
        <>
            <h1> Welcome, {user ? user.username : "please sign up or log in to access the chat"}. </h1>
        </>
    )
}

export default PubChat;