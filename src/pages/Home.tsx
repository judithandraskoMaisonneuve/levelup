import { IonContent, IonHeader, IonPage, IonToolbar } from '@ionic/react';
import './Home.css';
import DashboardContainer from '../components/DashboardContainer';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase';
import { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useUserPoints, leagueImages } from "../utils/points";
import { useLeagueDialog } from '../context/LeagueDialogContext';
import { useUserStreak, checkStreakRewards } from "../utils/streaks"; // Import the new streak hook
import { useToast } from '../context/ToastContext';

interface RouteParams {
  id: string;
}

const Home: React.FC = () => {
  const { id: userId } = useParams<RouteParams>();
  const [userData, setUserData] = useState<any>(null);
  const [newPhotoURL, setNewPhotoURL] = useState('');
  const history = useHistory();
  const { showToast } = useToast();

  // Fetch total points and league
  const { totalPoints, league } = useUserPoints(userId);
  const { showLeagueDialog } = useLeagueDialog();
  
  // Fetch user streak
  const { currentStreak, highestStreak } = useUserStreak(userId);

  // Ref to track whether modal has already been shown
  const hasShownDialog = useRef(false);

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

  // Check for streak milestone rewards
  useEffect(() => {
    const checkForRewards = async () => {
      if (userId && currentStreak > 0) {
        const result = await checkStreakRewards(userId, currentStreak);
        if (result.awarded) {
          showToast(`🎉 ${result.points} pts earned for ${result.milestone}-day streak!`);
        }
      }
    };
    
    checkForRewards();
  }, [currentStreak, userId]);

  return (
    <IonPage>
      <IonHeader id="home-header">
        <IonToolbar className="home-toolbar" onClick={navigateToProfile}>
          <div className="home-toolbar-content">
            {/* User Profile */}
            <div className="user-info">
              <img
                src={newPhotoURL || "https://ionicframework.com/docs/img/demos/avatar.svg"}
                alt="Profile"
                className="profile-pic"
              />
              <span className="username">@{userData?.username || "User"}</span>
            </div>

            {/* User Stats */}
            <div className="user-stats">
              <div className="streak">
                <img src="src/resources/icon-flame-nobg.png" alt="Streak" className="icon-flame" />
                <span>{currentStreak || 0}</span>
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
        <DashboardContainer userId={userId} />
      </IonContent>
    </IonPage>
  );
};

export default Home;