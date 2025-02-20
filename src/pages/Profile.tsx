import { IonContent, IonHeader, IonPage, IonButtons, IonBackButton, IonTitle, IonToolbar, IonImg } from '@ionic/react';
import ProfileContainer from '../components/ProfileContainer';
import { getAuth} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase';
import { useState, useEffect } from 'react';
import './Profile.css';

const Profile: React.FC = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    const [userData, setUserData] = useState<any>(null);
    const [newPhotoURL, setNewPhotoURL] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserData(data);
                    setNewPhotoURL(data.photoURL);
                }
            }
        };
        fetchUserData();
    }, [user]);

    return (
        <IonPage>
            <IonHeader className="profile-toolbar">
            <IonToolbar className="profile-toolbar">
                <IonButtons slot="start">
                    <IonBackButton defaultHref="#" />
                    <IonTitle className="profile-title">Profile</IonTitle>
                </IonButtons>
                <div className="profile-image-container">
                    <img id="profile-user-pfp" src={newPhotoURL || "https://ionicframework.com/docs/img/demos/avatar.svg"} />
                </div>
            </IonToolbar>
            </IonHeader>
            <IonContent className="profile-content">
                <ProfileContainer />
            </IonContent>
        </IonPage>
    );
};

export default Profile;
