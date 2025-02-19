import { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonText,
  useIonRouter,
  IonImg,
  IonLoading,
} from '@ionic/react';
import { auth, db } from '../../Firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import './AuthPage.css';

export const AuthPage: React.FC = () => {
  const router = useIonRouter();
  const [isSignUpActive, setIsSignUpActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Common state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [username, setUsername] = useState('');

  const containerClass = `auth-container ${isSignUpActive ? 'active' : ''}`;

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Check if username is unique
  const isUsernameUnique = async (username: string) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty; // true if no documents found with the same username
    } catch (error) {
      console.error('Error checking username uniqueness:', error);
      throw error;
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/profile', 'forward', 'push');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Signup handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
  
    if (!username.trim()) {
      setErrorMessage('Username cannot be empty');
      return;
    }
  
    try {
      setIsCheckingUsername(true);
  
      // Check if username is unique
      const isUnique = await isUsernameUnique(username);
  
      if (!isUnique) {
        setErrorMessage('This username is already taken. Please choose another one.');
        setIsCheckingUsername(false);
        return;
      }
  
      // Proceed with account creation if username is unique
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: username });
  
      // Array of profile pictures to choose from
      const profilePictures = [
        'https://i.imgur.com/KJmy3rd.png',
        'https://i.imgur.com/4uM4vvB.png',
        'https://i.imgur.com/ZLp4UsI.png'
      ];
  
      // Randomly select a profile picture
      const randomIndex = Math.floor(Math.random() * profilePictures.length);
      const randomPhotoURL = profilePictures[randomIndex];
  
      // Create user document in Firestore with a random profile picture
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        photoURL: randomPhotoURL,
        points: 0,
        createdAt: new Date(),
      });
  
      router.push('/profile', 'forward', 'push');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsCheckingUsername(false);
    }
  };
  

  return (
    <IonPage>
      {loading && (
        <div className="loading-screen">
          <IonImg className="loading-logo" src="src\resources\logo-levelup-bluebg.png" />
          <div className="loading-spinner"></div>
        </div>
      )}

      <IonLoading isOpen={isCheckingUsername} message={'Checking username availability...'} />

      <IonHeader>
        <IonToolbar>
          <IonTitle>Authentication</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding auth-content">
        <div className={containerClass}>
          {/* Sign Up Form */}
          <div className="form-container sign-up-container">
            <form onSubmit={handleSignUp}>
              <h2>Create Account</h2>

              <IonInput
                label="Username"
                labelPlacement="floating"
                fill="outline"
                className="auth-input"
                value={username}
                onIonChange={(e) => setUsername(e.detail.value!)}
              />

              <IonInput
                label="Email"
                type="email"
                labelPlacement="floating"
                fill="outline"
                className="auth-input"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value!)}
              />

              <IonInput
                label="Password"
                type="password"
                labelPlacement="floating"
                fill="outline"
                className="auth-input"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
              />

              <IonButton expand="block" className="auth-button" type="submit" disabled={isCheckingUsername}>
                Sign Up
              </IonButton>
            </form>
          </div>

          {/* Login Form */}
          <div className="form-container sign-in-container">
            <form onSubmit={handleLogin}>
              <h2>Sign In</h2>

              <IonInput
                label="Email"
                type="email"
                labelPlacement="floating"
                fill="outline"
                className="auth-input"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value!)}
              />

              <IonInput
                label="Password"
                type="password"
                labelPlacement="floating"
                fill="outline"
                className="auth-input"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
              />

              <IonButton expand="block" className="auth-button" type="submit">
                Sign In
              </IonButton>
            </form>
          </div>

          {/* Overlay Container */}
          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h2>Welcome Back!</h2>
                <p>To stay connected please login with your personal info</p>
                <IonButton fill="outline" className="ghost" onClick={() => setIsSignUpActive(false)}>
                  Sign In
                </IonButton>
              </div>

              <div className="overlay-panel overlay-right">
                <h2>Hello, Friend!</h2>
                <p>Enter your personal details and start journey with us</p>
                <IonButton fill="outline" className="ghost" onClick={() => setIsSignUpActive(true)}>
                  Sign Up
                </IonButton>
              </div>
            </div>
          </div>
        </div>

        {errorMessage && (
          <IonText color="danger" className="error-message">
            <p>{errorMessage}</p>
          </IonText>
        )}
      </IonContent>
    </IonPage>
  );
};