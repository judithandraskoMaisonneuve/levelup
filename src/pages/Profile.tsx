import { IonContent, IonHeader, IonPage, IonButtons, IonBackButton } from '@ionic/react';
import ProfileContainer from '../components/ProfileContainer';
import './Profile.css'

const Profile: React.FC = () => {
    

    return (
        <IonPage>
            <IonHeader className="profile-toolbar" >
                <IonButtons slot="start">
                    <IonBackButton default-href="#" />
                </IonButtons>
                
            </IonHeader>
            <IonContent className="profile-content" >
                <ProfileContainer/>
                
            </IonContent>
        </IonPage>
    );
};

export default Profile;