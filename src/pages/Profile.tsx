import { IonContent, IonHeader, IonPage, IonButtons, IonBackButton, IonTitle, IonToolbar } from '@ionic/react';
import ProfileContainer from '../components/ProfileContainer';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Profile.css';

interface RouteParams {
    id: string;
}

const Profile: React.FC = () => {
    const { id: userId } = useParams<RouteParams>();
    const [userData, setUserData] = useState<any>(null);
    const [newPhotoURL, setNewPhotoURL] = useState('');

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

    return (
        <IonPage>
            <IonHeader className="profile-toolbar">
                <IonToolbar className="profile-toolbar">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref={`/home/${userId}`} />
                        <IonTitle className="profile-title">Profile</IonTitle>
                    </IonButtons>
                    <div className="profile-image-container">
                        <img id="profile-user-pfp" src={newPhotoURL || "https://ionicframework.com/docs/img/demos/avatar.svg"} />
                    </div>
                </IonToolbar>
            </IonHeader>
            <IonContent className="profile-content">
                <ProfileContainer userId={userId} />
            </IonContent>
        </IonPage>
    );
};

export default Profile;
