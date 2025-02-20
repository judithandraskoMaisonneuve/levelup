import { IonContent, IonHeader, IonPage, IonToolbar } from '@ionic/react';
import './Home.css';
import DashboardContainer from '../components/DashboardContainer';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useUserPoints } from "../utils/points";

interface RouteParams {
  id: string;
}

const Home: React.FC = () => {
  const { id: userId } = useParams<RouteParams>();
  const [userData, setUserData] = useState<any>(null);
  const [newPhotoURL, setNewPhotoURL] = useState('');
  const history = useHistory();

  //fetch total Points
  const totalPoints = useUserPoints(userId);
  
  const navigateToProfile = () => {
    history.push(`/profile/${userId}`); 
  };

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
      <IonHeader id='home-header'>
        <IonToolbar className="home-toolbar" onClick={navigateToProfile}>
          <div className="home-toolbar-content">
            {/* User Profile */}
            <div className="user-info">
              <img
                src={newPhotoURL || "https://ionicframework.com/docs/img/demos/avatar.svg"}
                alt="Profile"
                className="profile-pic"
              />
              <span className="username">@{userData?.username || 'User'}</span>
            </div>

            {/* User Stats */}
            <div className="user-stats">
              <div className="streak">
                <img src="src/resources/icon-flame-nobg.png" alt="Streak" className="icon" />
                <span>0</span>
              </div>
              <div className="points">
                <img src="src/resources/icon-sardine-nobg.png" alt="Sardine Can" className="icon" />
                <span>{totalPoints ?? '0'} pts</span>
              </div>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <DashboardContainer userId={userId} />
      </IonContent>
    </IonPage>
  );
};

export default Home;
