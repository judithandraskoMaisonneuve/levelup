import { useState, useEffect } from 'react';
import './Scoreboard.css';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
  IonIcon,
  IonBackButton,
  IonButtons,
  IonBadge,
} from '@ionic/react';
import { trophy, arrowBack, medal } from 'ionicons/icons';
import { auth, db } from '../../Firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';

interface User {
  id: string;
  username: string;
  points: number;
  photoURL: string;
  lastPointsUpdate: Timestamp; // Ajout du timestamp de dernière mise à jour des points
  rank?: number;
}

export const ScoreboardPage: React.FC = () => {
  const [segment, setSegment] = useState<'global' | 'friends'>('global');
  const [globalUsers, setGlobalUsers] = useState<User[]>([]);
  const [friendUsers, setFriendUsers] = useState<User[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchGlobalRanking = async () => {
      try {
        // Récupérer tous les utilisateurs pour le classement
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        
        // Convertir les documents en utilisateurs et trier
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          username: doc.data().username,
          points: doc.data().points || 0,
          photoURL: doc.data().photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg',
          lastPointsUpdate: doc.data().lastPointsUpdate || Timestamp.now() // Utiliser un timestamp par défaut si non défini
        }));

        // Trier les utilisateurs par points et timestamp
        const sortedUsers = users.sort((a, b) => {
          if (b.points !== a.points) {
            return b.points - a.points;
          }
          // Si les points sont égaux, trier par timestamp (le plus ancien en premier)
          return a.lastPointsUpdate.seconds - b.lastPointsUpdate.seconds;
        });

        // Ajouter les rangs
        const rankedUsers = sortedUsers.map((user, index) => ({
          ...user,
          rank: index + 1
        }));

        // Définir le top 10
        setGlobalUsers(rankedUsers.slice(0, 10));

        // Trouver et définir le rang de l'utilisateur actuel
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
        
        const friendsData: User[] = [];
        
        // Récupérer les données des amis
        for (const friendDoc of friendsSnapshot.docs) {
          const friendRef = friendDoc.data().friendRef;
          const friendUserDoc = await getDoc(friendRef);
          
          if (friendUserDoc.exists()) {
            friendsData.push({
              id: friendUserDoc.id,
              username: friendUserDoc.data().username,
              points: friendUserDoc.data().points || 0,
              photoURL: friendUserDoc.data().photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg',
              lastPointsUpdate: friendUserDoc.data().lastPointsUpdate || Timestamp.now()
            });
          }
        }

        // Ajouter l'utilisateur actuel à la liste des amis
        const currentUserDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (currentUserDoc.exists()) {
          friendsData.push({
            id: auth.currentUser.uid,
            username: currentUserDoc.data().username,
            points: currentUserDoc.data().points || 0,
            photoURL: currentUserDoc.data().photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg',
            lastPointsUpdate: currentUserDoc.data().lastPointsUpdate || Timestamp.now()
          });
        }

        // Trier les amis par points et timestamp
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
  }, []);

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'warning'; // Or
      case 2:
        return 'medium'; // Argent
      case 3:
        return 'tertiary'; // Bronze
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
            (atteint le {formatLastUpdate(user.lastPointsUpdate)})
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
            <IonBackButton defaultHref="/home" icon={arrowBack} text="Retour" />
          </IonButtons>
          <IonTitle>Classement</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonSegment value={segment} onIonChange={(e) => setSegment(e.detail.value as 'global' | 'friends')}>
          <IonSegmentButton value="global">
            <IonLabel>Mondial</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="friends">
            <IonLabel>Amis</IonLabel>
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

            {/* Position actuelle de l'utilisateur */}
            {segment === 'global' && currentUserRank && (
              <div className="current-user-rank">
                <IonItem lines="none" className="divider">
                  <IonLabel>Votre position</IonLabel>
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