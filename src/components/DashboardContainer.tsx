import './DashboardContainer.css';
import { useHistory } from 'react-router-dom';

interface DashboardProps {
  userId: string;
}

const DashboardContainer: React.FC<DashboardProps> = ({ userId }) => {
  const history = useHistory();

  const navigateToMoodDiary = () => {
    history.push(`/moodtracker/${userId}`); 
  };

  const navigateToFriends = () => {
    history.push(`/friends/${userId}`); 
  };

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
        <div className="scoreboard">
          {/* Placeholder content */}
        </div>
      </div>

      {/* Journal Entries Section */}
      <h3 className="section-title">Journal Entries</h3>
      <div className="journalentries-section">
        <div className="journalentries">
          {/* Placeholder content */}
        </div>
      </div>

    </div>
  );
};

export default DashboardContainer;
