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
  IonSegmentButton
} from '@ionic/react';
import { personAdd, trash, trophy, checkmarkCircle, closeCircle, time } from 'ionicons/icons';
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
  updateDoc
} from 'firebase/firestore';

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
  requestDate: Date;
}

interface FriendDocument {
  friendRef: DocumentReference;
  addedAt: Date;
  status: 'pending' | 'accepted' | 'declined';
}

interface UserDocument {
  username: string;
  points: number;
  email: string;
  createdAt: Date;
  photoURL?: string;
}

export const FriendsPage: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [searchText, setSearchText] = useState('');
  const [foundUsers, setFoundUsers] = useState<any[]>([]);
  const [presentToast] = useIonToast();
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState<'friends' | 'requests'>('friends');
  const [requestsSegment, setRequestsSegment] = useState<'incoming' | 'outgoing'>('incoming');

  // Charger la liste d'amis
  useEffect(() => {
    if (!auth.currentUser) return;

    setLoading(true);
    
    // Amis acceptés
    const friendsRef = collection(db, `users/${auth.currentUser.uid}/friends`);
    const acceptedFriendsQuery = query(friendsRef, where('status', '==', 'accepted'));
    
    const unsubscribeFriends = onSnapshot(acceptedFriendsQuery, async (snapshot) => {
      const friendsData: Friend[] = [];
      
      for (const doc of snapshot.docs) {
        const data = doc.data() as FriendDocument;
        const friendUserDoc = await getDoc(data.friendRef);
        
        if (friendUserDoc.exists()) {
          const userData = friendUserDoc.data() as UserDocument;
          friendsData.push({
            id: doc.id,
            username: userData.username,
            points: userData.points || 0,
            photoURL: userData.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg'
          });
        }
      }
      
      setFriends(friendsData);
      setLoading(false);
    });

    // Demandes d'amis entrantes
    const incomingRequestsRef = collection(db, `users/${auth.currentUser.uid}/friendRequests`);
    const incomingQuery = query(incomingRequestsRef, where('status', '==', 'pending'));
    
    const unsubscribeIncoming = onSnapshot(incomingQuery, async (snapshot) => {
      const requestsData: FriendRequest[] = [];
      
      for (const doc of snapshot.docs) {
        const data = doc.data() as FriendDocument;
        const senderUserDoc = await getDoc(data.friendRef);
        
        if (senderUserDoc.exists()) {
          const userData = senderUserDoc.data() as UserDocument;
          requestsData.push({
            id: doc.id,
            username: userData.username,
            points: userData.points || 0,
            photoURL: userData.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg',
            status: data.status,
            requestDate: data.addedAt
          });
        }
      }
      
      setIncomingRequests(requestsData);
    });

    // Demandes d'amis sortantes
    const outgoingRequestsRef = collection(db, 'users');
    const unsubscribeOutgoing = onSnapshot(outgoingRequestsRef, async () => {
      const requestsData: FriendRequest[] = [];
      
      // Récupérer les utilisateurs auxquels on a envoyé une demande
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      for (const userDoc of usersSnapshot.docs) {
        if (userDoc.id === auth.currentUser.uid) continue;
        
        const userRequestsRef = collection(db, `users/${userDoc.id}/friendRequests`);
        const userRequestsQuery = query(
          userRequestsRef,
          where('friendRef', '==', doc(db, 'users', auth.currentUser.uid)),
          where('status', '==', 'pending')
        );
        
        const requestSnapshot = await getDocs(userRequestsQuery);
        
        if (!requestSnapshot.empty) {
          const userData = userDoc.data() as UserDocument;
          for (const reqDoc of requestSnapshot.docs) {
            const reqData = reqDoc.data() as FriendDocument;
            requestsData.push({
              id: reqDoc.id,
              username: userData.username,
              points: userData.points || 0,
              photoURL: userData.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg',
              status: reqData.status,
              requestDate: reqData.addedAt
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
  }, []);

  // Rechercher des utilisateurs
  const searchUsers = async (searchValue: string) => {
    if (searchValue.length < 3) {
      setFoundUsers([]);
      return;
    }

    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('username', '>=', searchValue),
      where('username', '<=', searchValue + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs
      .map(doc => ({ ...doc.data(), id: doc.id }))
      .filter(user => user.id !== auth.currentUser?.uid);
    
    // Filtrer les utilisateurs qui sont déjà amis ou ont des demandes en cours
    const filteredUsers = [];
    for (const user of users) {
      // Vérifier si déjà ami
      const isAlreadyFriend = friends.some(friend => {
        const friendId = friend.id.split('_')[1] || friend.id;
        return friendId === user.id;
      });
      
      // Vérifier si demande sortante existe déjà
      const hasPendingOutgoing = outgoingRequests.some(req => {
        const reqId = req.id.split('_')[1] || req.id;
        return reqId === user.id;
      });
      
      // Vérifier si demande entrante existe déjà
      const hasPendingIncoming = incomingRequests.some(req => {
        const reqId = req.id.split('_')[1] || req.id;
        return reqId === user.id;
      });
      
      if (!isAlreadyFriend && !hasPendingOutgoing && !hasPendingIncoming) {
        filteredUsers.push(user);
      }
    }
    
    setFoundUsers(filteredUsers);
  };

  // Envoyer une demande d'ami
  const sendFriendRequest = async (friendId: string) => {
    if (!auth.currentUser) return;

    try {
      const friendRef = doc(db, 'users', friendId);
      
      // Ajouter la demande dans la collection friendRequests du destinataire
      await addDoc(collection(db, `users/${friendId}/friendRequests`), {
        friendRef: doc(db, 'users', auth.currentUser.uid),
        addedAt: new Date(),
        status: 'pending'
      });

      presentToast({
        message: 'Demande d\'ami envoyée avec succès!',
        duration: 2000,
        color: 'success'
      });
      
      setSearchText('');
      setFoundUsers([]);
    } catch (error) {
      presentToast({
        message: 'Erreur lors de l\'envoi de la demande d\'ami',
        duration: 2000,
        color: 'danger'
      });
    }
  };

  // Accepter une demande d'ami
  const acceptFriendRequest = async (requestId: string, friendId: string) => {
    if (!auth.currentUser) return;

    try {
      // 1. Mettre à jour le statut de la demande entrante
      const requestRef = doc(db, `users/${auth.currentUser.uid}/friendRequests`, requestId);
      await updateDoc(requestRef, { status: 'accepted' });
      
      // 2. Ajouter l'utilisateur à la liste d'amis (avec statut accepté)
      await addDoc(collection(db, `users/${auth.currentUser.uid}/friends`), {
        friendRef: doc(db, 'users', friendId),
        addedAt: new Date(),
        status: 'accepted'
      });
      
      // 3. Ajouter l'utilisateur actuel à la liste d'amis de l'autre utilisateur
      await addDoc(collection(db, `users/${friendId}/friends`), {
        friendRef: doc(db, 'users', auth.currentUser.uid),
        addedAt: new Date(),
        status: 'accepted'
      });
      
      presentToast({
        message: 'Demande d\'ami acceptée!',
        duration: 2000,
        color: 'success'
      });
    } catch (error) {
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
      // Mettre à jour le statut de la demande
      const requestRef = doc(db, `users/${auth.currentUser.uid}/friendRequests`, requestId);
      await updateDoc(requestRef, { status: 'declined' });
      
      presentToast({
        message: 'Demande d\'ami refusée',
        duration: 2000,
        color: 'success'
      });
    } catch (error) {
      presentToast({
        message: 'Erreur lors du refus de la demande',
        duration: 2000,
        color: 'danger'
      });
    }
  };

  // Annuler une demande d'ami sortante
  const cancelFriendRequest = async (requestId: string, friendId: string) => {
    if (!auth.currentUser) return;

    try {
      // Trouver et supprimer la demande dans la collection friendRequests du destinataire
      const friendRequestsRef = collection(db, `users/${friendId}/friendRequests`);
      const q = query(
        friendRequestsRef,
        where('friendRef', '==', doc(db, 'users', auth.currentUser.uid)),
        where('status', '==', 'pending')
      );
      
      const querySnapshot = await getDocs(q);
      for (const document of querySnapshot.docs) {
        await deleteDoc(doc(db, `users/${friendId}/friendRequests`, document.id));
      }
      
      presentToast({
        message: 'Demande d\'ami annulée',
        duration: 2000,
        color: 'success'
      });
    } catch (error) {
      presentToast({
        message: 'Erreur lors de l\'annulation de la demande',
        duration: 2000,
        color: 'danger'
      });
    }
  };

  // Supprimer un ami
  const deleteFriend = async (friendId: string) => {
    if (!auth.currentUser) return;

    try {
      // Trouver le document d'ami à supprimer
      const friendsRef = collection(db, `users/${auth.currentUser.uid}/friends`);
      const q = query(friendsRef, where('status', '==', 'accepted'));
      const querySnapshot = await getDocs(q);
      
      for (const document of querySnapshot.docs) {
        const data = document.data() as FriendDocument;
        const friendDoc = await getDoc(data.friendRef);
        
        if (friendDoc.id === friendId) {
          // 1. Supprimer l'ami de la liste de l'utilisateur actuel
          await deleteDoc(doc(db, `users/${auth.currentUser.uid}/friends`, document.id));
          
          // 2. Trouver et supprimer l'utilisateur actuel de la liste d'amis de l'autre utilisateur
          const otherFriendsRef = collection(db, `users/${friendId}/friends`);
          const otherQ = query(
            otherFriendsRef,
            where('friendRef', '==', doc(db, 'users', auth.currentUser.uid)),
            where('status', '==', 'accepted')
          );
          
          const otherQuerySnapshot = await getDocs(otherQ);
          for (const otherDoc of otherQuerySnapshot.docs) {
            await deleteDoc(doc(db, `users/${friendId}/friends`, otherDoc.id));
          }
          
          break;
        }
      }
      
      presentToast({
        message: 'Ami supprimé avec succès!',
        duration: 2000,
        color: 'success'
      });
    } catch (error) {
      presentToast({
        message: 'Erreur lors de la suppression de l\'ami',
        duration: 2000,
        color: 'danger'
      });
    }
  };

  // Extraire l'ID d'utilisateur à partir d'une référence
  const getUserIdFromRef = (friendDocId: string) => {
    // Si l'ID contient un underscore, c'est probablement un ID généré
    // Sinon, c'est directement l'ID utilisateur
    const parts = friendDocId.split('_');
    return parts.length > 1 ? parts[1] : friendDocId;
  };

  return (
    <IonPage>
      <IonHeader id="friends-header">
        <IonToolbar className="friends-toolbar">
          <div className="home-toolbar-content">
            <IonTitle>Mes Amis et Demandes</IonTitle>
          </div>
        </IonToolbar>
      </IonHeader>
  
      <IonContent className="friends-page-content ion-padding">
        {/* Barre de recherche */}
        <div className="searchbar-container">
          <IonSearchbar
            value={searchText}
            onIonChange={e => {
              setSearchText(e.detail.value!);
              searchUsers(e.detail.value!);
            }}
            placeholder="Rechercher des utilisateurs"
          />
        </div>
  
        {/* Résultats de la recherche */}
        {foundUsers.length > 0 && (
          <IonList className="search-results">
            {foundUsers.map(user => (
              <IonItem key={user.id}>
                <IonAvatar slot="start">
                  <img src={user.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg'} alt="Profile" />
                </IonAvatar>
                <IonLabel>
                  <h2>{user.username}</h2>
                  <p>
                    <IonIcon icon={trophy} color="warning" /> {user.points || 0} points
                  </p>
                </IonLabel>
                <IonButton 
                  className="add-friend-button"
                  slot="end"
                  onClick={() => sendFriendRequest(user.id)}
                >
                  <IonIcon icon={personAdd} slot="icon-only" />
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}
  
        {/* Segments pour choisir entre amis et demandes */}
        <IonSegment value={segment} onIonChange={e => setSegment(e.detail.value as 'friends' | 'requests')}>
          <IonSegmentButton value="friends">
            <IonLabel>Mes amis</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="requests">
            <IonLabel>Demandes
              {(incomingRequests.length > 0) && <IonBadge color="danger" className="notification-badge">{incomingRequests.length}</IonBadge>}
            </IonLabel>
          </IonSegmentButton>
        </IonSegment>
        
        {segment === 'friends' ? (
          /* Liste d'amis */
          <>
            <div className="friends-counter">
              <h2>Mes amis</h2>
              <IonBadge color="primary">{friends.length}</IonBadge>
            </div>
            
            {loading ? (
              <div className="loading-container">
                {[...Array(3)].map((_, index) => (
                  <IonItem key={`skeleton-${index}`}>
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
              <IonList className="friends-list">
                {friends.map(friend => (
                  <IonItem key={friend.id}>
                    <IonAvatar slot="start">
                      <img src={friend.photoURL} alt={friend.username} />
                    </IonAvatar>
                    <IonLabel>
                      <h2>{friend.username}</h2>
                    </IonLabel>
                    <IonBadge color="warning" slot="end">
                      <IonIcon icon={trophy} /> {friend.points}
                    </IonBadge>
                    <IonButton 
                      className="delete-friend-button"
                      fill="clear"
                      slot="end"
                      onClick={() => deleteFriend(getUserIdFromRef(friend.id))}
                    >
                      <IonIcon icon={trash} slot="icon-only" />
                    </IonButton>
                  </IonItem>
                ))}
              </IonList>
            ) : (
              <div className="empty-state">
                <IonIcon icon={personAdd} />
                <h3>Aucun ami pour le moment</h3>
                <p>Utilisez la barre de recherche pour trouver des amis</p>
              </div>
            )}
          </>
        ) : (
          /* Liste des demandes */
          <>
            <IonSegment value={requestsSegment} onIonChange={e => setRequestsSegment(e.detail.value as 'incoming' | 'outgoing')}>
              <IonSegmentButton value="incoming">
                <IonLabel>Reçues 
                  {incomingRequests.length > 0 && <IonBadge color="danger" className="notification-badge">{incomingRequests.length}</IonBadge>}
                </IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="outgoing">
                <IonLabel>Envoyées {outgoingRequests.length > 0 && <IonBadge color="primary" className="notification-badge">{outgoingRequests.length}</IonBadge>}</IonLabel>
              </IonSegmentButton>
            </IonSegment>
            
            {requestsSegment === 'incoming' ? (
              /* Demandes reçues */
              incomingRequests.length > 0 ? (
                <IonList className="requests-list">
                  {incomingRequests.map(request => (
                    <IonItem key={request.id}>
                      <IonAvatar slot="start">
                        <img src={request.photoURL} alt={request.username} />
                      </IonAvatar>
                      <IonLabel>
                        <h2>{request.username}</h2>
                        <p>
                          <IonIcon icon={time} /> {new Date(request.requestDate.toMillis()).toLocaleDateString()}
                        </p>
                      </IonLabel>
                      <IonButton 
                        className="accept-button"
                        slot="end"
                        color="success"
                        onClick={() => acceptFriendRequest(request.id, getUserIdFromRef(request.id))}
                      >
                        <IonIcon icon={checkmarkCircle} slot="icon-only" />
                      </IonButton>
                      <IonButton 
                        className="decline-button"
                        slot="end"
                        color="danger"
                        onClick={() => declineFriendRequest(request.id)}
                      >
                        <IonIcon icon={closeCircle} slot="icon-only" />
                      </IonButton>
                    </IonItem>
                  ))}
                </IonList>
              ) : (
                <div className="empty-state">
                  <IonIcon icon={time} />
                  <h3>Aucune demande reçue</h3>
                  <p>Vous n'avez pas de nouvelles demandes d'amis</p>
                </div>
              )
            ) : (
              /* Demandes envoyées */
              outgoingRequests.length > 0 ? (
                <IonList className="requests-list">
                  {outgoingRequests.map(request => (
                    <IonItem key={request.id}>
                      <IonAvatar slot="start">
                        <img src={request.photoURL} alt={request.username} />
                      </IonAvatar>
                      <IonLabel>
                        <h2>{request.username}</h2>
                        <p>
                          <IonIcon icon={time} /> {new Date(request.requestDate.toMillis()).toLocaleDateString()}
                        </p>
                      </IonLabel>
                      <IonButton 
                        className="cancel-button"
                        slot="end"
                        color="medium"
                        onClick={() => cancelFriendRequest(request.id, getUserIdFromRef(request.id))}
                      >
                        <IonIcon icon={closeCircle} slot="icon-only" />
                      </IonButton>
                    </IonItem>
                  ))}
                </IonList>
              ) : (
                <div className="empty-state">
                  <IonIcon icon={personAdd} />
                  <h3>Aucune demande envoyée</h3>
                  <p>Vous n'avez pas de demandes d'amis en attente</p>
                </div>
              )
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default FriendsPage;