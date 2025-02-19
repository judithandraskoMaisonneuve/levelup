import { useState, useEffect } from 'react';
import { IonInput, IonIcon, IonButton, IonSpinner } from '@ionic/react';
import { eyeOutline, createOutline, cameraOutline } from 'ionicons/icons';
import { getAuth, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db} from '../Firebase'
import './ProfileContainer.css';

const ProfileContainer: React.FC = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    const [showPassword, setShowPassword] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [username, setUsername] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [newPhotoURL, setNewPhotoURL] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserData(data);
                    setUsername(data.username);
                    setNewPhotoURL(data.photoURL);
                }
            }
        };
        fetchUserData();
    }, [user]);

    // Function to check if a username is unique
    const isUsernameUnique = async (username: string) => { 
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('username', '==', username));
            const querySnapshot = await getDocs(q);
            return querySnapshot.empty; // true if no documents found with the same username
        } catch (error) {
            console.error('Error checking username uniqueness:', error);
            throw error;
        }
    };

    // Handle username change
    const handleUsernameChange = async () => {
        if (!username.trim()) return;
        setIsCheckingUsername(true);
        
        const isUnique = await isUsernameUnique(username);
        if (!isUnique) {
            alert('Username already taken. Choose another.');
            setIsCheckingUsername(false);
            return;
        }

        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { username });
            await updateProfile(user, { displayName: username });
            setUserData((prev: any) => ({ ...prev, username }));
        }

        setIsCheckingUsername(false);
    };

    // Handle profile picture change
    /*const handleProfilePictureChange = async (event: any) => {
        const file = event.target.files[0];
        if (!file || !user) return;

        setIsUploading(true);
        const storageRef = ref(storage, `profile_pictures/${user.uid}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { photoURL: downloadURL });
        await updateProfile(user, { photoURL: downloadURL });

        setNewPhotoURL(downloadURL);
        setUserData((prev: any) => ({ ...prev, photoURL: downloadURL }));
        setIsUploading(false);
    };*/

    return (
        <div id="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    <label htmlFor="profile-pic-upload" className="profile-pic-label">
                        <img src={newPhotoURL || "src/resources/pfp-cat-nobg.png"} alt="Profile" />
                        {isUploading ? <IonSpinner /> : <IonIcon icon={cameraOutline} className="camera-icon" />}
                    </label>
                    <input type="file" id="profile-pic-upload" accept="image/*" /*onChange={handleProfilePictureChange}*/ hidden />
                </div>
                <h2 id="username-title">@{userData?.username || "User"}</h2>
            </div>

            <h3 className="section-titles">Profile</h3>
            <div className="profile-section">
                <div className="profile-info">
                    <img src="src/resources/icon-cathead-nobg.png" className="icon" alt="icon" />
                    <IonInput value={username} onIonInput={(e) => setUsername(e.detail.value!)} className="profile-input" />
                    <IonButton className='save-button' onClick={handleUsernameChange} disabled={isCheckingUsername}>
                        {isCheckingUsername ? <IonSpinner /> : "Save"}
                    </IonButton>
                </div>
            </div>

            <h3 className="section-titles">League</h3>
            <div className="league-section">
                <div className="profile-info">
                    <p>You are in the sardine league</p>
                    <img src="src/resources/icon-sardine-nobg.png" className="icon" alt="league icon" />
                    <strong>{userData?.points || 0} pts</strong>
                </div>
            </div>

            <h3 className="section-titles">Email</h3>
            <div className="email-section">
                <IonInput value={userData?.email || ""} readonly className="profile-input" />
            </div>

           {/** 
           <h3 className="section-titles">Password</h3>
            <div className="pwd-section">
                <div className="password-container">
                    <IonInput type={showPassword ? "text" : "password"} value="********" readonly className="profile-input" />
                    <IonIcon icon={eyeOutline} className="eye-icon" onClick={() => setShowPassword(!showPassword)} />
                </div>
            </div>
            */} 
        </div>
    );
};

export default ProfileContainer;
