import { useState } from "react";
import axios from "axios";
import {useNavigate} from "react-router";
import "./Auth.css";

const Signup = ({ setUser }) => {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [isInvalid, setIsInvalid] = useState(false);
    const [invalidMessage, setInvalidMessage] = useState('');

    const navigate = useNavigate();

    const showMessage = () => {
        setIsInvalid(true);

        setTimeout(() => {
            setIsInvalid(false);
        }, 1500)
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result);
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const newUser = {
            "username": name,
            "email": email,
            "isBanned": false,
            "password": password,
            "profilePicture": profilePicture
        }

        axios.post('/api/signup', newUser).then(res => {
            setUser(res.data);
            navigate('/')
        }).catch(e => {
            setInvalidMessage(e.response.data);
            showMessage();
        })

        setName('')
        setPassword('')
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h1>Sign Up</h1>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <label> Name:
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)}/>
                    </label>
                    <label> Email:
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </label>
                    <label> Password:
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </label>
                    <label> Profile Picture:
                        <input type="file" accept="image/*" onChange={handleFileChange}/>
                    </label>
                    {previewUrl && (
                        <div className="profile-preview">
                            <img src={previewUrl} alt="Profile preview" className="profile-preview-img"/>
                        </div>
                    )}
                    <button className="auth-button" type="submit">Register</button>
                </form>
                <small> (Please do not use your real password) </small>
                {isInvalid && <p className="error-text">{invalidMessage}</p>}
            </div>
        </div>
    )

}

export default Signup;