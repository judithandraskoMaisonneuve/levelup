import { 
    IonContent, IonHeader, IonPage, IonButtons, 
    IonBackButton, IonTitle, IonToolbar 
} from '@ionic/react';
import ProfileContainer from '../components/ProfileContainer';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase';
import { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import './Profile.css';

interface RouteParams {
    id: string;
}

const Profile: React.FC = () => {
    const { id: userId } = useParams<RouteParams>();
    const [userData, setUserData] = useState<any>(null);
    const [newPhotoURL, setNewPhotoURL] = useState('');
    const history = useHistory();
    const auth = getAuth();

    useEffect(() => {
        const fetchUserData = async () => {
            if (userId) {
                const userDocRef = doc(db, 'users', userId);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserData(data);
                    setNewPhotoURL(data.photoURL);
                }
            }
        };
        fetchUserData();
    }, [userId]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            history.push('/authpage'); 
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <IonPage>
            <IonHeader className="profile-toolbar">
                <IonToolbar className="profile-toolbar">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref={`/home/${userId}`} />
                        <IonTitle className="profile-title">Profile</IonTitle>
                    </IonButtons>
                    <div className="profile-image-container">
                        <img 
                            id="profile-user-pfp" 
                            src={newPhotoURL || "https://ionicframework.com/docs/img/demos/avatar.svg"} 
                            alt="User profile"
                        />
                    </div>
                    <IonButtons slot="end">
                        <button className='profile-logout-btn' onClick={handleLogout}>Logout</button>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="profile-content">
                <ProfileContainer userId={userId} />
            </IonContent>
        </IonPage>
    );
};

export default Profile;
