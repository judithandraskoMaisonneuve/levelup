import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../Firebase';
import { collection, getDocs } from 'firebase/firestore';
import './BadgesContainer.css';
import badgesList from "../utils/badges";

interface RouteParams {
  id: string;
}

const BadgesContainer: React.FC = () => {
  const { id: userId } = useParams<RouteParams>(); 
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set());

  // Fetch user's earned badges from Firestore
  useEffect(() => {
    if (!userId) return;

    const fetchBadges = async () => {
      try {
        const badgesRef = collection(db, "users", userId, "badges");
        const snapshot = await getDocs(badgesRef);
        const badges = new Set(snapshot.docs.map(doc => doc.data().name));
        setEarnedBadges(badges);
      } catch (error) {
        console.error("Error fetching badges:", error);
      }
    };

    fetchBadges();
  }, [userId]);

  return (
    <div className="badges-container">
      <h2>Your Badges</h2>
      <div className="badges-grid">
        {Object.entries(badgesList).map(([badgeName, imageUrl]) => (
          <div key={badgeName} className={`badge-item ${earnedBadges.has(badgeName) ? '' : 'disabled'}`}>
            <img src={imageUrl} alt={badgeName} />
            <p>{badgeName}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgesContainer;
