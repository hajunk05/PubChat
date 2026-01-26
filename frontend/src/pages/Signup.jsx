import { useState } from "react";
import axios from "axios";

const Signup = ({ setUser }) => {

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const newUser = {
            "username": name,
            "isBanned": false,
            "password": password
        }

        axios.post('/api/signup', newUser).then(res => {
            setUser(res.data);
        }).catch(e => {
            console.error(e)
        })

        setName('')
        setPassword('')
    }

    return (
        <>
            <div>
                <h1> Sign up </h1>
                <form onSubmit={handleSubmit}>
                    <label> Name: <input type="text" value={name} onChange={(e) => setName(e.target.value)}/>
                    </label>
                    <label> Password: <input type="text" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </label>
                    <button type="submit"> Register </button>
                </form>
            </div>
        </>
    )

}

export default Signup;