import { useEffect, useState } from 'react';
import './DashboardContainer.css';
import { useHistory } from 'react-router-dom';
import { db } from '../Firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { getOrdinalSuffix } from '../utils/datesuffix';

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
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);

  const formatDate = (timestamp: any): string => {
    const date = timestamp.toDate();
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' }); 
    const year = date.getFullYear();
    
    return `${month} ${getOrdinalSuffix(day)}, ${year}`;
};

  useEffect(() => {
    if (!userId) return;

    const fetchDiaryEntries = async () => {
      try {
        const q = query(
          collection(db, 'diaryEntries'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const entries: DiaryEntry[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as DiaryEntry[];

        setDiaryEntries(entries);
      } catch (error) {
        console.error('Error fetching diary entries:', error);
      }
    };

    fetchDiaryEntries();
  }, [userId]);

  const navigateToMoodDiary = () => history.push(`/moodtracker/${userId}`);
  const navigateToFriends = () => history.push(`/friends/${userId}`);

  return (
    <div id="dashboard-container">
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

          <div className="menu-item">
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
      <div className="scoreboard-section">
        <div className="scoreboard">{/* Placeholder content */}</div>
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
                <h4 className="diary-timestamp">{formatDate(entry.timestamp)}</h4>
                <p className="diary-text">{entry.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardContainer;
