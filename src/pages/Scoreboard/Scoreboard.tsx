import { useState, useEffect } from 'react';
import './Scoreboard.css';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonAvatar, IonSegment, IonSegmentButton, IonSkeletonText,IonIcon,IonBackButton,IonButtons,IonBadge} from '@ionic/react';
import { trophy, arrowBack, medal } from 'ionicons/icons';
import { auth, db } from '../../Firebase';
import { collection, query, getDocs, doc, getDoc,Timestamp } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { useUserPoints, leagueImages } from '../../utils/points';


interface User {
  id: string;
  username: string;
  points: number;
  photoURL: string;
  lastPointsUpdate: Timestamp;
  rank?: number;
}

interface RouteParams {
  id: string;
}

export const ScoreboardPage: React.FC = () => {
  const [segment, setSegment] = useState<'global' | 'friends'>('global');
  const [globalUsers, setGlobalUsers] = useState<User[]>([]);
  const [friendUsers, setFriendUsers] = useState<User[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { id: userId } = useParams<RouteParams>();

  // Utiliser useUserPoints au niveau du composant
  const {currentUserPoints, currentUserLeague} = useUserPoints(auth.currentUser?.uid || '');

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchGlobalRanking = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        
        // Récupérer les points directement depuis la collection 'points'
        const pointsRef = collection(db, 'points');
        const pointsSnapshot = await getDocs(pointsRef);
        
        // Créer un map des points par utilisateur
        const pointsByUser = new Map();
        pointsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const userId = data.userId;
          const points = data.points || 0;
          pointsByUser.set(userId, (pointsByUser.get(userId) || 0) + points);
        });

        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          username: doc.data().username,
          points: pointsByUser.get(doc.id) || 0,
          photoURL: doc.data().photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg',
          lastPointsUpdate: doc.data().lastPointsUpdate || Timestamp.now()
        }));

        const sortedUsers = users.sort((a, b) => {
          if (b.points !== a.points) {
            return b.points - a.points;
          }
          return a.lastPointsUpdate.seconds - b.lastPointsUpdate.seconds;
        });

        const rankedUsers = sortedUsers.map((user, index) => ({
          ...user,
          rank: index + 1
        }));

        setGlobalUsers(rankedUsers.slice(0, 10));

        const currentUserIndex = rankedUsers.findIndex(
          user => user.id === auth.currentUser?.uid
        );

        if (currentUserIndex !== -1) {
          setCurrentUserRank(rankedUsers[currentUserIndex]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du classement global:', error);
      }
    };

    const fetchFriendsRanking = async () => {
      try {
        if (!auth.currentUser) return;

        const friendsRef = collection(db, `users/${auth.currentUser.uid}/friends`);
        const friendsSnapshot = await getDocs(friendsRef);
        
        // Récupérer les points directement depuis la collection 'points'
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
              lastPointsUpdate: friendData.lastPointsUpdate || Timestamp.now()
            };
          }
          return null;
        });

        const friendsData = (await Promise.all(friendsPromises)).filter((friend): friend is User => friend !== null);

        // Ajouter l'utilisateur courant à la liste des amis
        const currentUserDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (currentUserDoc.exists()) {
          const userData = currentUserDoc.data();
          
          friendsData.push({
            id: auth.currentUser.uid,
            username: userData.username,
            points: pointsByUser.get(auth.currentUser.uid) || 0,
            photoURL: userData.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg',
            lastPointsUpdate: userData.lastPointsUpdate || Timestamp.now()
          });
        }

        const sortedFriends = friendsData
          .sort((a, b) => {
            if (b.points !== a.points) {
              return b.points - a.points;
            }
            return a.lastPointsUpdate.seconds - b.lastPointsUpdate.seconds;
          })
          .map((friend, index) => ({
            ...friend,
            rank: index + 1
          }));

        setFriendUsers(sortedFriends);
      } catch (error) {
        console.error('Erreur lors de la récupération du classement des amis:', error);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchGlobalRanking(), fetchFriendsRanking()]);
      setLoading(false);
    };

    fetchData();
  }, [currentUserPoints]); // Ajouter currentUserPoints comme dépendance

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'warning';
      case 2:
        return 'medium';
      case 3:
        return 'tertiary';
      default:
        return 'primary';
    }
  };

  const formatLastUpdate = (timestamp: Timestamp) => {
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  const renderUserItem = (user: User, showRank: boolean = true) => (
    <IonItem key={user.id} className="animated-item">
      <IonAvatar slot="start">
        <img src={user.photoURL} alt={user.username} />
      </IonAvatar>
      <IonLabel>
        <h2>{user.username}</h2>
        <p>
          <IonIcon icon={trophy} color="warning" /> {user.points} points  
          <span className="points-date"> 
            reached on  {formatLastUpdate(user.lastPointsUpdate)} 
          </span>
        </p>
      </IonLabel>
      {showRank && (
        <IonBadge slot="end" color={getMedalColor(user.rank || 0)}>
          {user.rank === 1 && <IonIcon icon={medal} />}
          #{user.rank}
        </IonBadge>
      )}
    </IonItem>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/home/${userId}`} icon={arrowBack} />
          </IonButtons>
          <IonTitle>Scoreboard</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className='scoreboard-content'>
        <IonSegment value={segment} onIonChange={(e) => setSegment(e.detail.value as 'global' | 'friends')}>
          <IonSegmentButton value="global">
            <IonLabel >World</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="friends">
            <IonLabel>Friends</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {loading ? (
          <div className="loading-container">
            {[...Array(5)].map((_, index) => (
              <IonItem key={`skeleton-${index}`}>
                <IonAvatar slot="start">
                  <IonSkeletonText animated />
                </IonAvatar>
                <IonLabel>
                  <h2><IonSkeletonText animated style={{ width: '70%' }} /></h2>
                  <p><IonSkeletonText animated style={{ width: '30%' }} /></p>
                </IonLabel>
              </IonItem>
            ))}
          </div>
        ) : (
          <>
            <IonList className="animated-list">
              {segment === 'global' 
                ? globalUsers.map(user => renderUserItem(user))
                : friendUsers.map(user => renderUserItem(user))
              }
            </IonList>

            {segment === 'global' && currentUserRank && (
              <div className="current-user-rank">
                <IonItem lines="none" className="divider">
                  <IonLabel>Your Rank!</IonLabel>
                </IonItem>
                {renderUserItem(currentUserRank)}
              </div>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ScoreboardPage;