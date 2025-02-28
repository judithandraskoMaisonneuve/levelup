import { useEffect, useState } from 'react';
import './DashboardContainer.css';
import { useHistory } from 'react-router-dom';
import { db, auth } from '../Firebase';
import { collection, query, where, orderBy, getDocs, getDoc } from 'firebase/firestore';
import { getOrdinalSuffix } from '../utils/datesuffix';
import { useUserPoints } from '../utils/points'
import { medal } from 'ionicons/icons'
import { IonList, IonItem, IonLabel, IonAvatar, IonBadge, IonIcon } from '@ionic/react';

interface DashboardProps {
  userId: string;
}

interface DiaryEntry {
  id: string;
  text: string;
  moodColor: string;
  timestamp: any;
}

const DashboardContainer: React.FC<DashboardProps> = ({ userId }) => {
  const history = useHistory();
  //Diary logs
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);

  // Friends Scoreboard 
  const [friendUsers, setFriendUsers] = useState<User[]>([]);
  const { currentUserPoints, currentUserLeague } = useUserPoints(auth.currentUser?.uid || '');

  const formatDate = (timestamp: any): string => {
    const date = timestamp.toDate();
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' }); 
    const year = date.getFullYear();
    
    return `${month} ${getOrdinalSuffix(day)}, ${year}`;
};

  useEffect(() => {
    const fetchFriendsRanking = async () => {
      if (!auth.currentUser) return;

      try {
        const friendsRef = collection(db, `users/${auth.currentUser.uid}/friends`);
        const friendsSnapshot = await getDocs(friendsRef);

        const pointsRef = collection(db, 'points');
        const pointsSnapshot = await getDocs(pointsRef);
        
        const pointsByUser = new Map();
        pointsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          pointsByUser.set(data.userId, (pointsByUser.get(data.userId) || 0) + (data.points || 0));
        });

        const friendsPromises = friendsSnapshot.docs.map(async (friendDoc) => {
          const friendRef = friendDoc.data().friendRef;
          const friendUserDoc = await getDoc(friendRef);
          
          if (friendUserDoc.exists()) {
            const friendData = friendUserDoc.data();
            const points = pointsByUser.get(friendUserDoc.id) || 0;
            
            return {
              id: friendUserDoc.id,
              username: friendData.username,
              points: points,
              photoURL: friendData.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg',
            };
          }
          return null;
        });

        const friendsData = (await Promise.all(friendsPromises)).filter((friend): friend is User => friend !== null);

        // Sort friends by points
        const sortedFriends = friendsData.sort((a, b) => b.points - a.points)
          .map((friend, index) => ({ ...friend, rank: index + 1 }));

        setFriendUsers(sortedFriends);
      } catch (error) {
        console.error('Error fetching friends scoreboard:', error);
      }
    };

    fetchFriendsRanking();
  }, [currentUserPoints]);

  useEffect(() => {
    if (!userId) return;
  
    const fetchDiaryEntries = async () => {
      try {
        const q = query(
          collection(db, "users", userId, "diaryEntries"),
          orderBy("timestamp", "desc") // Sorting by timestamp
        );
  
        const querySnapshot = await getDocs(q);
        const entries: DiaryEntry[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<DiaryEntry, "id">) // Type safety
        }));
  
        setDiaryEntries(entries);
      } catch (error) {
        console.error("Error fetching diary entries:", error);
      }
    };
  
    fetchDiaryEntries();
  }, [userId]);
  

  const getMoodImage = (moodColor: string): string => {
    const moodImages: { [key: string]: string } = {
      "#efe2e2" : "src/resources/cat-calm.png", 
      "#8be36e" : "src/resources/cat-happy.png", 
      "#ffd166" : "src/resources/cat-excited.png", 
      "#89e3f7" : "src/resources/cat-sad.png", 
      "#ffb6c1": "src/resources/cat-grateful.png", 
      "#ef5454" : "src/resources/cat-angry.png", 
    };
  
    return moodImages[moodColor] || "src/resources/mood-default.png"; 
  };

  const navigateToMoodDiary = () => history.push(`/moodtracker/${userId}`);
  const navigateToFriends = () => history.push(`/friends/${userId}`);
  const navigateToScoreboard = () => history.push(`/scoreboard/${userId}`);
  const navigateToBadges = () => history.push(`/badges/${userId}`);

  return (
    <div className="dashboard-container">
      {/* Favorites Section */}
      <div className="favorites-section">
        <h3 className="favorites-title">My</h3>
        <img className="heart-icon" alt="Heart icon" src="src/resources/icon-heart-nobg.png" />
        
        {/* Favorite's Menu options */}
        <div className="menu-options">
          <div className="menu-item" onClick={navigateToMoodDiary}>
            <img src="src/resources/cat-calm.png" alt="Mood Diary" className="menu-icon" />
            <h5 className="menu-text">Mood Diary</h5>
          </div>

          <div className="menu-item" onClick={navigateToBadges}>
            <img src="src/resources/badge-trasheater-nobg.png" alt="Badges" className="menu-icon" />
            <h5 className="menu-text">Badges</h5>
          </div>

          <div className="menu-item" onClick={navigateToFriends}>
            <img src="src/resources/icon-catfriends-nobg.png" alt="Friends" className="menu-icon" />
            <h5 className="menu-text">Friends</h5>
          </div>
        </div>
      </div>

      {/* Scoreboard Section */}
      <h3 className="section-title">Scoreboard</h3>
      <div className="scoreboard-section" onClick={navigateToScoreboard}>
        <div className="scoreboard-dashboard">
        {friendUsers.length === 0 ? (
          <p className="empty-message">No friends' scores available.</p>
        ) : (
          <IonList>
            {friendUsers.map((user) => (
              <IonItem key={user.id} className="scoreboard-item-dashboard">
                <IonAvatar slot="start">
                  <img src={user.photoURL} alt={user.username} />
                </IonAvatar>
                <IonLabel>
                  <h2>{user.username}</h2>
                  <p>{user.points} points</p>
                </IonLabel>
                <IonBadge slot="end" color={user.rank === 1 ? 'warning' : user.rank === 2 ? 'medium' : user.rank === 3 ? 'tertiary' : 'primary'}>
                  {user.rank === 1 && <IonIcon icon={medal} />}
                  #{user.rank}
                </IonBadge>
              </IonItem>
            ))}
          </IonList>
        )}
        </div>
      </div>

      {/* Journal Entries Section */}
      <h3 className="section-title">Journal Entries</h3>
      <div className="journalentries-section">
        {diaryEntries.length === 0 ? (
          <p className="empty-message">No diary entries yet.</p>
        ) : (
          <div className="journalentries">
            {diaryEntries.map(entry => (
              <div key={entry.id} className="diary-entry-card" style={{ backgroundColor: entry.moodColor }}>
                <div className="diary-text">
                  <h4 className="diary-timestamp">{formatDate(entry.timestamp)}</h4>
                  <p className="diary-text">{entry.text}</p>
                </div>
                <div className="diary-image-section">
                  <img src={getMoodImage(entry.moodColor)} alt="Mood cat image" id="diary-mood-image" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardContainer;
