import { IonContent, IonHeader, IonPage, IonToolbar } from '@ionic/react';
import './Home.css';
import DashboardContainer from '../components/DashboardContainer';
import { getAuth} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase';
import { useState, useEffect } from 'react';

const Home: React.FC = () => {
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
      <IonHeader id='home-header'>
        <IonToolbar className="home-toolbar">
          <div className="home-toolbar-content">
            {/* User Profile */}
            <div className="user-info">
              <img src={newPhotoURL || "https://ionicframework.com/docs/img/demos/avatar.svg"} alt="Profile" className="profile-pic" />
              <span className="username">@{userData.username || 'User'}</span>
            </div>

            {/* User Stats */}
            <div className="user-stats">
              <div className="streak">
                <img src="src/resources/icon-flame-nobg.png" alt="Streak" className="icon" />
                <span>0</span>
              </div>
              <div className="points">
                <img src="src/resources/icon-sardine-nobg.png" alt="Sardine Can" className="icon" />
                <span>{userData.pts || 'Null'}</span>
              </div>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <DashboardContainer/>
      </IonContent>
    </IonPage>
  );
};

export default Home;
