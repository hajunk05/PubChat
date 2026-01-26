import { useState } from "react";
import axios from "axios";
import {useNavigate} from "react-router";

const Login = ({ setUser }) => {

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(`/api/login?username=${name}&password=${password}`).then(res => {
            setUser(res.data);
            navigate('/')
        }).catch((e) => {
            window.alert(e.response.data);
        })


        setName('')
        setPassword('')
    }

    return (
        <>
            <div>
                <h1> Log In </h1>
                <form onSubmit={handleSubmit}>
                    <label> Name: <input type="text" value={name} onChange={(e) => setName(e.target.value)}/>
                    </label>
                    <label> Password: <input type="text" value={password}
                                             onChange={(e) => setPassword(e.target.value)}/>
                    </label>
                    <button type="submit"> Login </button>
                </form>
            </div>
        </>
    )

}

export default Login;