import { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonSearchbar,
  IonBadge,
  IonIcon,
  useIonToast,
  IonAvatar,
  IonSkeletonText,
  IonSegment,
  IonSegmentButton,
  useIonRouter,
  IonBackButton,
  IonButtons,
} from '@ionic/react';
import { personAdd, trash, trophy, checkmarkCircle, closeCircle, time, arrowBack } from 'ionicons/icons';
import { auth, db } from '../../Firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  DocumentReference,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import './Friends.css'; // Fichier CSS pour les animations
import { useParams } from 'react-router-dom';

// Définir les types pour les données Firestore
interface Friend {
  id: string;
  username: string;
  points: number;
  photoURL: string;
}

interface FriendRequest {
  id: string;
  username: string;
  points: number;
  photoURL: string;
  status: 'pending' | 'accepted' | 'declined';
  requestDate: Timestamp;
}

interface FriendDocument {
  friendRef: DocumentReference;
  addedAt: Timestamp;
  status: 'pending' | 'accepted' | 'declined';
}

interface UserDocument {
  username: string;
  points: number;
  email: string;
  createdAt: Date;
  photoURL?: string;
}

interface RouteParams {
  id: string;
}

export const FriendsPage: React.FC = () => {
  const router = useIonRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [searchText, setSearchText] = useState('');
  const [foundUsers, setFoundUsers] = useState<any[]>([]);
  const [presentToast] = useIonToast();
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState<'friends' | 'requests'>('friends');
  const [requestsSegment, setRequestsSegment] = useState<'incoming' | 'outgoing'>('incoming');
  const [isSearching, setIsSearching] = useState(false);
  const [userPoints, setUserPoints] = useState<Map<string, number>>(new Map());

  const { id: userId } = useParams<RouteParams>();

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const checkAuth = () => {
      if (!auth.currentUser) {
        router.push('/authPage', 'forward', 'replace');
      }
    };

    checkAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/auth', 'forward', 'replace');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Charger les points de tous les utilisateurs depuis la collection 'points'
  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchUserPoints = async () => {
      try {
        const pointsRef = collection(db, 'points');
        const pointsSnapshot = await getDocs(pointsRef);
        
        // Créer un map des points par utilisateur
        const pointsByUser = new Map<string, number>();
        
        pointsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const userId = data.userId;
          const points = data.points || 0;
          
          // Mettre à jour les points totaux
          pointsByUser.set(userId, (pointsByUser.get(userId) || 0) + points);
        });

        setUserPoints(pointsByUser);
        console.log('Points chargés pour tous les utilisateurs:', pointsByUser);
      } catch (error) {
        console.error('Erreur lors du chargement des points:', error);
      }
    };

    fetchUserPoints();
  }, [auth.currentUser]);

  // Charger la liste d'amis et les demandes
  useEffect(() => {
    if (!auth.currentUser) return;

    setLoading(true);

    // Récupérer tous les amis
    const friendsRef = collection(db, `users/${auth.currentUser.uid}/friends`);
    const friendsQuery = query(friendsRef);

    const unsubscribeFriends = onSnapshot(friendsQuery, async (snapshot) => {
      const friendsData: Friend[] = [];

      for (const doc of snapshot.docs) {
        const data = doc.data() as FriendDocument;
        console.log('Référence de l\'ami:', data.friendRef.path); // Log pour vérifier la référence

        const friendUserDoc = await getDoc(data.friendRef);

        if (friendUserDoc.exists()) {
          const userData = friendUserDoc.data() as UserDocument;
          const friendId = friendUserDoc.id;
          // Utiliser les points de la collection 'points' si disponibles
          const points = userPoints.get(friendId) || userData.points || 0;
          
          friendsData.push({
            id: friendId,
            username: userData.username,
            points: points,
            photoURL: userData.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg',
          });

          console.log('Ami récupéré:', {
            id: friendId,
            username: userData.username,
            points: points,
            photoURL: userData.photoURL,
          });
        } else {
          console.error('Document ami introuvable:', data.friendRef.path);
          // Supprimer la référence invalide
          await deleteDoc(doc.ref);
        }
      }

      setFriends(friendsData);
      console.log('Friends state updated:', friendsData); // Log pour vérifier l'état des amis
      setLoading(false);
    });

    // Demandes d'amis entrantes
    const incomingRequestsRef = collection(db, `users/${auth.currentUser.uid}/friendRequests`);
    const incomingQuery = query(incomingRequestsRef, where('status', '==', 'pending'));

    const unsubscribeIncoming = onSnapshot(incomingQuery, async (snapshot) => {
      const requestsData: FriendRequest[] = [];

      for (const doc of snapshot.docs) {
        const data = doc.data() as FriendDocument;
        const senderUserDoc = await getDoc(data.friendRef); // Utiliser la référence correcte

        if (senderUserDoc.exists()) {
          const userData = senderUserDoc.data() as UserDocument;
          const senderId = senderUserDoc.id;
          // Utiliser les points de la collection 'points' si disponibles
          const points = userPoints.get(senderId) || userData.points || 0;
          
          requestsData.push({
            id: doc.id,
            username: userData.username,
            points: points,
            photoURL: userData.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg',
            status: data.status,
            requestDate: data.addedAt,
          });

          // Ajouter un log pour afficher les informations de la demande entrante
          console.log('Demande entrante récupérée:', {
            id: doc.id,
            username: userData.username,
            points: points,
            photoURL: userData.photoURL,
            status: data.status,
            requestDate: data.addedAt.toDate(),
          });
        }
      }

      setIncomingRequests(requestsData);
    });

    // Demandes d'amis sortantes
    const outgoingRequestsRef = collection(db, 'users');
    const unsubscribeOutgoing = onSnapshot(outgoingRequestsRef, async () => {
      if (!auth.currentUser) return;

      const requestsData: FriendRequest[] = [];

      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);

      for (const userDoc of usersSnapshot.docs) {
        if (userDoc.id === auth.currentUser.uid) continue;

        const userRequestsRef = collection(db, `users/${userDoc.id}/friendRequests`);
        const userRequestsQuery = query(
          userRequestsRef,
          where('friendRef', '==', doc(db, 'users', auth.currentUser.uid)), // Référence correcte
          where('status', '==', 'pending')
        );

        const requestSnapshot = await getDocs(userRequestsQuery);

        if (!requestSnapshot.empty) {
          const userData = userDoc.data() as UserDocument;
          const userId = userDoc.id;
          // Utiliser les points de la collection 'points' si disponibles
          const points = userPoints.get(userId) || userData.points || 0;
          
          for (const reqDoc of requestSnapshot.docs) {
            const reqData = reqDoc.data() as FriendDocument;
            requestsData.push({
              id: reqDoc.id,
              username: userData.username,
              points: points,
              photoURL: userData.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg',
              status: reqData.status,
              requestDate: reqData.addedAt,
            });

            // Ajouter un log pour afficher les informations de la demande sortante
            console.log('Demande sortante récupérée:', {
              id: reqDoc.id,
              username: userData.username,
              points: points,
              photoURL: userData.photoURL,
              status: reqData.status,
              requestDate: reqData.addedAt.toDate(),
            });
          }
        }
      }

      setOutgoingRequests(requestsData);
    });

    return () => {
      unsubscribeFriends();
      unsubscribeIncoming();
      unsubscribeOutgoing();
    };
  }, [auth.currentUser, userPoints]); // Ajouter userPoints comme dépendance pour mettre à jour lorsque les points changent

  // Rechercher des utilisateurs dynamiquement
  useEffect(() => {
    if (searchText.trim() === '') {
      setFoundUsers([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const searchUsers = async () => {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('username', '>=', searchText),
        where('username', '<=', searchText + '\uf8ff')
      );

      try {
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs
          .map((doc) => {
            const userData = doc.data();
            const userId = doc.id;
            // Utiliser les points de la collection 'points' si disponibles
            const points = userPoints.get(userId) || userData.points || 0;
            
            return { 
              ...userData, 
              id: userId,
              points: points 
            };
          })
          .filter((user) => user.id !== auth.currentUser?.uid);

        // Ajouter un log pour afficher les utilisateurs trouvés
        console.log('Utilisateurs trouvés:', users);

        // Filtrer les utilisateurs déjà amis ou avec des demandes en cours
        const filteredUsers = users.filter((user) => {
          const isAlreadyFriend = friends.some((friend) => friend.id === user.id);
          const hasPendingOutgoing = outgoingRequests.some((req) => req.id === user.id);
          const hasPendingIncoming = incomingRequests.some((req) => req.id === user.id);
          return !isAlreadyFriend && !hasPendingOutgoing && !hasPendingIncoming;
        });

        setFoundUsers(filteredUsers);
      } catch (error) {
        console.error('Erreur de recherche:', error);
        presentToast({
          message: 'Erreur lors de la recherche d\'utilisateurs',
          duration: 2000,
          color: 'danger',
        });
      } finally {
        setIsSearching(false);
      }
    };

    searchUsers();
  }, [searchText, friends, outgoingRequests, incomingRequests, userPoints]);

  // Envoyer une demande d'ami
  const sendFriendRequest = async (friendId: string) => {
    if (!auth.currentUser) return;

    try {
      const friendRef = doc(db, 'users', friendId); // Référence correcte

      // Vérifier si l'utilisateur est déjà ami
      const isAlreadyFriend = friends.some((friend) => friend.id === friendId);
      if (isAlreadyFriend) {
        presentToast({
          message: 'Vous êtes déjà ami avec cet utilisateur',
          duration: 2000,
          color: 'warning',
        });
        return;
      }

      // Vérifier si une demande est déjà en cours
      const hasPendingRequest = outgoingRequests.some((req) => req.id === friendId);
      if (hasPendingRequest) {
        presentToast({
          message: 'Une demande est déjà en cours avec cet utilisateur',
          duration: 2000,
          color: 'warning',
        });
        return;
      }

      // Ajouter la demande d'ami dans la collection `friendRequests` de l'ami
      await addDoc(collection(db, `users/${friendId}/friendRequests`), {
        friendRef: doc(db, 'users', auth.currentUser.uid), // Référence correcte
        addedAt: Timestamp.now(),
        status: 'pending',
      });

      // Ajouter un log pour afficher la demande envoyée
      console.log('Demande d\'ami envoyée à:', {
        id: friendId,
        username: foundUsers.find((u) => u.id === friendId)?.username || '',
        points: foundUsers.find((u) => u.id === friendId)?.points || 0,
        photoURL: foundUsers.find((u) => u.id === friendId)?.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg',
      });

      // Mettre à jour l'état local des demandes sortantes
      setOutgoingRequests((prev) => [
        ...prev,
        {
          id: friendId,
          username: foundUsers.find((u) => u.id === friendId)?.username || '',
          points: foundUsers.find((u) => u.id === friendId)?.points || 0,
          photoURL: foundUsers.find((u) => u.id === friendId)?.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg',
          status: 'pending',
          requestDate: Timestamp.now(),
        },
      ]);

      presentToast({
        message: 'Demande d\'ami envoyée avec succès!',
        duration: 2000,
        color: 'success',
      });

      setFoundUsers((prev) => prev.filter((user) => user.id !== friendId));
      setSearchText('');
    } catch (error) {
      presentToast({
        message: 'Erreur lors de l\'envoi de la demande d\'ami',
        duration: 2000,
        color: 'danger',
      });
    }
  };

  const acceptFriendRequest = async (requestId: string, friendId: string) => {
    if (!auth.currentUser) return;

    try {
        // 1. Obtenir les informations de la requête d'ami
        const friendRequestRef = doc(db, `users/${auth.currentUser.uid}/friendRequests`, requestId);
        const friendRequestDoc = await getDoc(friendRequestRef);
        
        if (!friendRequestDoc.exists()) {
            throw new Error('Requête d\'ami introuvable');
        }

        const friendRequestData = friendRequestDoc.data() as FriendDocument;
        const senderRef = friendRequestData.friendRef; // Référence vers l'utilisateur qui a envoyé la demande
        const senderId = senderRef.id; // ID correct de l'ami

        // 2. Mettre à jour le statut de la requête
        await updateDoc(friendRequestRef, { status: 'accepted' });

        // 3. Ajouter l'ami à la collection `friends` de l'utilisateur actuel
        await addDoc(collection(db, `users/${auth.currentUser.uid}/friends`), {
            friendRef: senderRef,
            addedAt: Timestamp.now(),
            status: 'accepted'
        });

        // 4. Ajouter l'utilisateur actuel à la collection `friends` de l'ami
        await addDoc(collection(db, `users/${senderId}/friends`), {
            friendRef: doc(db, 'users', auth.currentUser.uid),
            addedAt: Timestamp.now(),
            status: 'accepted'
        });

        // 5. Mettre à jour l'état local
        const requestInfo = incomingRequests.find(req => req.id === requestId);
        if (requestInfo) {
            setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
            setFriends(prev => [...prev, {
                id: senderId, // Utiliser l'ID correct de l'ami
                username: requestInfo.username,
                points: requestInfo.points,
                photoURL: requestInfo.photoURL
            }]);
        }

        presentToast({
            message: 'Demande d\'ami acceptée!',
            duration: 2000,
            color: 'success'
        });
    } catch (error) {
        console.error('Erreur lors de l\'acceptation de la demande:', error);
        presentToast({
            message: 'Erreur lors de l\'acceptation de la demande',
            duration: 2000,
            color: 'danger'
        });
    }
};

// Refuser une demande d'ami
const declineFriendRequest = async (requestId: string) => {
    if (!auth.currentUser) return;

    try {
        const requestRef = doc(db, `users/${auth.currentUser.uid}/friendRequests`, requestId);
        await updateDoc(requestRef, { status: 'declined' });

        setIncomingRequests((prev) => prev.filter((req) => req.id !== requestId));

        presentToast({
            message: 'Demande d\'ami refusée',
            duration: 2000,
            color: 'success',
        });
    } catch (error) {
        presentToast({
            message: 'Erreur lors du refus de la demande',
            duration: 2000,
            color: 'danger',
        });
    }
};

  // Annuler une demande d'ami sortante
  const cancelFriendRequest = async (requestId: string, friendId: string) => {
    if (!auth.currentUser) return;

    try {
      const friendRequestsRef = collection(db, `users/${friendId}/friendRequests`);
      const q = query(
        friendRequestsRef,
        where('friendRef', '==', doc(db, 'users', auth.currentUser.uid)), // Référence correcte
        where('status', '==', 'pending')
      );

      const querySnapshot = await getDocs(q);
      for (const document of querySnapshot.docs) {
        await deleteDoc(doc(db, `users/${friendId}/friendRequests`, document.id));
      }

      setOutgoingRequests((prev) => prev.filter((req) => req.id !== requestId));

      presentToast({
        message: 'Demande d\'ami annulée',
        duration: 2000,
        color: 'success',
      });
    } catch (error) {
      presentToast({
        message: 'Erreur lors de l\'annulation de la demande',
        duration: 2000,
        color: 'danger',
      });
    }
  };

  // Supprimer un ami
  const deleteFriend = async (friendId: string) => {
    if (!auth.currentUser) return;

    try {
      const friendsRef = collection(db, `users/${auth.currentUser.uid}/friends`);
      const q = query(friendsRef, where('status', '==', 'accepted'));
      const querySnapshot = await getDocs(q);

      for (const document of querySnapshot.docs) {
        const data = document.data() as FriendDocument;
        const friendDoc = await getDoc(data.friendRef);

        if (friendDoc.id === friendId) {
          await deleteDoc(doc(db, `users/${auth.currentUser.uid}/friends`, document.id));

          const otherFriendsRef = collection(db, `users/${friendId}/friends`);
          const otherQ = query(
            otherFriendsRef,
            where('friendRef', '==', doc(db, 'users', auth.currentUser.uid)), // Référence correcte
            where('status', '==', 'accepted')
          );

          const otherQuerySnapshot = await getDocs(otherQ);
          for (const otherDoc of otherQuerySnapshot.docs) {
            await deleteDoc(doc(db, `users/${friendId}/friends`, otherDoc.id));
          }

          // Ajouter un log pour afficher l'ami supprimé
          console.log('Ami supprimé:', {
            id: friendId,
            username: friends.find((f) => f.id === friendId)?.username || '',
            points: friends.find((f) => f.id === friendId)?.points || 0,
            photoURL: friends.find((f) => f.id === friendId)?.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg',
          });

          break;
        }
      }

      setFriends((prev) => prev.filter((friend) => friend.id !== friendId));

      presentToast({
        message: 'Ami supprimé avec succès!',
        duration: 2000,
        color: 'success',
      });
    } catch (error) {
      presentToast({
        message: 'Erreur lors de la suppression de l\'ami',
        duration: 2000,
        color: 'danger',
      });
    }
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar id="friends-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/home/${userId}`} icon={arrowBack}  />
          </IonButtons>
          <IonTitle>Friends</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* Barre de recherche */}
        <IonSearchbar
          value={searchText}
          style={{color: "var(--secondary)"}}
          onIonChange={(e) => setSearchText(e.detail.value!)}
          placeholder="Search for new friends"
          className="animated-searchbar"
        />

        {/* Résultats de la recherche */}
        {isSearching && <p className="searching-text">Recherche en cours...</p>}
        {!isSearching && searchText.trim() !== '' && (
          <IonList className="animated-list">
            {foundUsers.map((user) => (
              <IonItem key={user.id} className="animated-item">
                <IonAvatar slot="start">
                  <img src={user.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg'} alt="Profile" />
                </IonAvatar>
                <IonLabel>
                  <h2>{user.username}</h2>
                  <p>
                    <IonIcon icon={trophy} color="warning" /> {user.points || 0} points
                  </p>
                </IonLabel>
                <IonButton slot="end" onClick={() => sendFriendRequest(user.id)}>
                  <IonIcon icon={personAdd} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}

        {/* Segments pour choisir entre amis et demandes */}
        <IonSegment value={segment} onIonChange={(e) => setSegment(e.detail.value as 'friends' | 'requests')}>
          <IonSegmentButton value="friends">
            <IonLabel>Friends</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="requests">
            <IonLabel>Requests</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* Liste des amis */}
        {segment === 'friends' && (
          <>
            <div className="friends-counter">
              <h2>My Friends</h2>
              <IonBadge color="primary">{friends.length}</IonBadge>
            </div>

            {loading ? (
              <div className="loading-container">
                {[...Array(3)].map((_, index) => (
                  <IonItem key={`skeleton-${index}`} className="animated-item">
                    <IonAvatar slot="start">
                      <IonSkeletonText animated />
                    </IonAvatar>
                    <IonLabel>
                      <h2><IonSkeletonText animated style={{ width: '70%' }} /></h2>
                      <p><IonSkeletonText animated style={{ width: '30%' }} /></p>
                    </IonLabel>
                    <IonSkeletonText slot="end" animated style={{ width: '20%', height: '2rem' }} />
                  </IonItem>
                ))}
              </div>
            ) : friends.length > 0 ? (
              <IonList className="friends-list animated-list">
                {friends.map((friend) => {
                  console.log('Rendering friend:', friend); // Log pour vérifier le rendu des amis
                  return (
                    <IonItem key={friend.id} className="animated-item">
                      <IonAvatar slot="start">
                        <img src={friend.photoURL} alt={friend.username} />
                      </IonAvatar>
                      <IonLabel>
                        <h2>{friend.username}</h2>
                        <p>
                          <IonIcon icon={trophy} /> {friend.points} points
                        </p>
                      </IonLabel>
                      <IonButton
                        className="delete-friend-button"
                        fill="clear"
                        slot="end"
                        onClick={() => deleteFriend(friend.id)}
                      >
                        <IonIcon icon={trash} slot="icon-only" />
                      </IonButton>
                    </IonItem>
                  );
                })}
              </IonList>
            ) : (
              <div className="empty-state animated-empty">
                <IonIcon icon={personAdd} size="large" />
                <h3>It's quiet in here</h3>
                <p>Use the search bar to find friends!</p>
              </div>
            )}
          </>
        )}

        {/* Liste des demandes */}
        {segment === 'requests' && (
          <>
            <IonSegment value={requestsSegment} onIonChange={(e) => setRequestsSegment(e.detail.value as 'incoming' | 'outgoing')}>
              <IonSegmentButton value="incoming">
                <IonLabel>Received</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="outgoing">
                <IonLabel>Sent</IonLabel>
              </IonSegmentButton>
            </IonSegment>

            {/* Demandes reçues */}
            {requestsSegment === 'incoming' && (
              <IonList className="animated-list">
                {incomingRequests.length > 0 ? (
                  incomingRequests.map((request) => (
                    <IonItem key={request.id} className="animated-item">
                      <IonAvatar slot="start">
                        <img src={request.photoURL} alt={request.username} />
                      </IonAvatar>
                      <IonLabel>
                        <h2>{request.username}</h2>
                        <p>
                          <IonIcon icon={time} /> {request.requestDate.toDate().toLocaleDateString()}
                        </p>
                      </IonLabel>
                      <IonButton slot="end" color="success" onClick={() => acceptFriendRequest(request.id, request.id)}>
                        <IonIcon icon={checkmarkCircle} />
                      </IonButton>
                      <IonButton slot="end" color="danger" onClick={() => declineFriendRequest(request.id)}>
                        <IonIcon icon={closeCircle} />
                      </IonButton>
                    </IonItem>
                  ))
                ) : (
                  <div className="empty-state animated-empty">
                    <IonIcon icon={personAdd} size="large" />
                    <h3>No friend requests yet!</h3>
                  </div>
                )}
              </IonList>
            )}

            {/* Demandes envoyées */}
            {requestsSegment === 'outgoing' && (
              <IonList className="animated-list">
                {outgoingRequests.length > 0 ? (
                  outgoingRequests.map((request) => (
                    <IonItem key={request.id} className="animated-item">
                      <IonAvatar slot="start">
                        <img src={request.photoURL} alt={request.username} />
                      </IonAvatar>
                      <IonLabel>
                        <h2>{request.username}</h2>
                        <p>
                          <IonIcon icon={time} /> {request.requestDate.toDate().toLocaleDateString()}
                        </p>
                      </IonLabel>
                      <IonButton slot="end" color="medium" onClick={() => cancelFriendRequest(request.id, request.id)}>
                        <IonIcon icon={closeCircle} />
                      </IonButton>
                    </IonItem>
                  ))
                ) : (
                  <div className="empty-state animated-empty">
                    <IonIcon icon={personAdd} size="large" />
                    <h3>No pending requests!</h3>
                  </div>
                )}
              </IonList>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default FriendsPage;