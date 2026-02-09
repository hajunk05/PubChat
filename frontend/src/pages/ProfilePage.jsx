import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProfilePage.css";

const ProfilePage = ({ user, setUser }) => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    if (!user) {
        navigate('/');
        return null;
    }

    const handleProfilePictureChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setUpdateError('');
        setUpdateSuccess('');

        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const res = await axios.put(`/api/users/${user.id}`, {
                    profilePicture: reader.result
                });
                if (res.data) {
                    setUser(res.data);
                    setUpdateSuccess('Profile picture updated!');
                    setTimeout(() => setUpdateSuccess(''), 2000);
                }
                if (!res.data?.profilePicture) {
                    setIsUploading(false);
                }
            } catch (e) {
                const errorMsg = typeof e.response?.data === 'string'
                    ? e.response.data
                    : 'Failed to update profile picture';
                setUpdateError(errorMsg);
                setIsUploading(false);
            }
        };
        reader.onerror = () => {
            setUpdateError('Failed to read image file');
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="profile-page-wrapper">
            <div className="profile-page-card">
                <h2>My Profile</h2>

                <div className="profile-picture-section">
                    <div className={`profile-picture-large ${isUploading ? 'uploading' : ''}`}>
                        {isUploading && <div className="upload-spinner"></div>}
                        {user.profilePicture ? (
                            <img
                                src={user.profilePicture}
                                alt={user.username}
                                onLoad={() => setIsUploading(false)}
                                onError={() => setIsUploading(false)}
                                style={isUploading ? { display: 'none' } : {}}
                            />
                        ) : (
                            !isUploading && <span>{user.username.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleProfilePictureChange}
                        style={{ display: 'none' }}
                        disabled={isUploading}
                    />
                    <button
                        className="update-picture-btn"
                        onClick={() => fileInputRef.current.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Update Picture'}
                    </button>
                </div>

                <div className="username-section">
                    <label>Username:</label>
                    <span>{user.username}</span>
                </div>

                <div className="email-section">
                    <label>Email:</label>
                    <span>{user.email}</span>
                </div>

                {updateError && <p className="error-text">{updateError}</p>}
                {updateSuccess && <p className="success-text">{updateSuccess}</p>}
            </div>
        </div>
    );
};

export default ProfilePage;
