import { useState, useEffect } from 'react';
import { IonInput, IonButton, IonSpinner, IonToast } from '@ionic/react';
import { getAuth, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../Firebase';
import './ProfileContainer.css';
import { useUserPoints } from "../utils/points";
import { leagueImages } from '../utils/points';

interface ProfileContainerProps {
    userId: string;
}

const ProfileContainer: React.FC<ProfileContainerProps> = ({ userId }) => {
    const auth = getAuth();
    const user = auth.currentUser;

    const [userData, setUserData] = useState<{ username?: string; points?: number; email?: string }>({});
    const [username, setUsername] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [passwordResetSent, setPasswordResetSent] = useState(false);

    // Fetch total points
    const { totalPoints, league } = useUserPoints(userId);

    useEffect(() => {
        const fetchUserData = async () => {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserData(data);
                setUsername(data.username || 'user');
            }
        };
        fetchUserData();
    }, [userId]);

    const isUsernameUnique = async (username: string) => {
        const q = query(collection(db, 'users'), where('username', '==', username));
        return (await getDocs(q)).empty;
    };

    const handleUsernameChange = async () => {
        if (!username.trim()) return;
        setIsCheckingUsername(true);

        if (!(await isUsernameUnique(username))) {
            alert('Username already taken. Choose another.');
            setIsCheckingUsername(false);
            return;
        }

        await updateDoc(doc(db, 'users', userId), { username });
        if (user) {
            await updateProfile(user, { displayName: username });
        }
        setUserData((prev) => ({ ...prev, username }));
        setIsCheckingUsername(false);
    };

    const handlePasswordReset = async () => {
        if (user?.email) {
            await sendPasswordResetEmail(auth, user.email);
            setPasswordResetSent(true);
            console.log("Reset email sent!");
        }
    };

    return (
        <div id="profile-container">
            <h2 id="username-title">@{userData.username || 'User'}</h2>

            <h3 className="section-titles">Profile</h3>
            <div className="username-section">
                <img src=''/>
                <IonInput value={username} onIonInput={(e) => setUsername(e.detail.value!)} className="profile-input username-input" />
                <button onClick={handleUsernameChange} disabled={isCheckingUsername} className="save-usernamechange-btn">
                    {isCheckingUsername ? <IonSpinner /> : "Save"}
                </button>
            </div>

            <h3 className="section-titles">League</h3>
            <div className="league-section">
                <p>You have <b>{totalPoints ?? '0'} pts</b> ! You are in the <b>{league ?? 'Sardine'}</b> league</p>
                {league && leagueImages[league] && (
                    <img 
                        src={leagueImages[league]} 
                        alt={`${league} league badge`} 
                        className="profile-league-image"
                    />
                )}
            </div>

            <h3 className="section-titles">Email</h3>
            <div className="email-section">
                <IonInput value={userData.email || ''} readonly className="profile-input email-input" />
            </div>

            <button onClick={handlePasswordReset} className="change-pwd-btn">Change Password</button>
            <IonToast
                isOpen={passwordResetSent}
                onDidDismiss={() => setPasswordResetSent(false)}
                message="Reset email sent!"
                duration={3000}
                position="top"
                className="ion-toast-custom"
            />
        </div>
    );
};

export default ProfileContainer;
