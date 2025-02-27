import { IonContent, IonHeader, IonPage, IonToolbar, IonBackButton } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase';
import { useState, useEffect} from 'react';
import { useHistory } from 'react-router-dom';
import { useUserPoints, leagueImages } from "../utils/points";
import { useLeagueDialog } from '../context/LeagueDialogContext';
import "./Badges.css"
import BadgesContainer from '../components/BadgesContainer';

interface RouteParams {
  id: string;
}

const Badges: React.FC = () => {
  const { id: userId } = useParams<RouteParams>();
  const [userData, setUserData] = useState<any>(null);
  const [newPhotoURL, setNewPhotoURL] = useState('');
  const history = useHistory();

  // Fetch total points and league
  const { totalPoints, league } = useUserPoints(userId);
  const { showLeagueDialog } = useLeagueDialog();


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
      <IonHeader id="badge-header">
        <IonToolbar className="badge-toolbar">
          <div className="badge-toolbar-content">
            <div >
                <IonBackButton defaultHref={`/home/${userId}`} />
            </div>

            {/* User Stats */}
            <div className="user-stats">
              <div className="streak">
                <img src="src/resources/icon-flame-nobg.png" alt="Streak" className="icon-flame" />
                <span>0</span>
              </div>
              <div className="points">
                <img
                  src={leagueImages[league ?? "Sardine"] || "https://i.imgur.com/vQFy3RO.png"}
                  alt={league ?? "Sardine"}
                  className="icon-league"
                />
                <span>{totalPoints ?? "0"} pts</span>
              </div>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <BadgesContainer/>
      </IonContent>
    </IonPage>
  );
};

export default Badges;
