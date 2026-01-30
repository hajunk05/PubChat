import { useState } from "react";
import axios from "axios";
import {useNavigate} from "react-router";
import "./Auth.css";

const Login = ({ setUser }) => {

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [isInvalid, setIsInvalid] = useState(false);
    const [invalidMessage, setInvalidMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate()

    const showMessage = () => {
        setIsInvalid(true);

        setTimeout(() => {
            setIsInvalid(false);
        }, 1500)
    }


    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        axios.post(`/api/login?username=${name}&password=${password}`).then(res => {
            setUser(res.data);
            navigate('/')
        }).catch(e => {
            setInvalidMessage(e.response.data);
            showMessage();
            setIsLoading(false);
        })
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h1>Log In</h1>
                {isLoading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <>
                        <form className="auth-form" onSubmit={handleSubmit}>
                            <label> Name:
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)}/>
                            </label>
                            <label> Password:
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                            </label>
                            <button className="auth-button" type="submit">Login</button>
                        </form>
                        {isInvalid && <p className="error-text">{invalidMessage}</p>}
                    </>
                )}
            </div>
        </div>
    )

}

export default Login;