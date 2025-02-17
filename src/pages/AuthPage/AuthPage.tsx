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
  IonImg
} from '@ionic/react';
import { auth, db } from '../../Firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import './AuthPage.css'; // Create this CSS file

export const AuthPage: React.FC = () => {
  const router = useIonRouter();
  const [isSignUpActive, setIsSignUpActive] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Common state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [username, setUsername] = useState("");

  const containerClass = `auth-container ${isSignUpActive ? 'active' : ''}`;

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

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
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: username });
      
      // Photo de profil par défaut pour les nouveaux utilisateurs
      const defaultPhotoURL = 'https://ionicframework.com/docs/img/demos/avatar.svg';
      
      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        photoURL: defaultPhotoURL,
        points: 0,
        createdAt: new Date(),
      });
      
      router.push('/profile', 'forward', 'push');
    } catch (err: any) {
      setErrorMessage(err.message);
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
                onIonChange={(e) => setUsername(e.detail.value!)}
              />
              
              <IonInput
                label="Email"
                type="email"
                labelPlacement="floating"
                fill="outline"
                className="auth-input"
                onIonChange={(e) => setEmail(e.detail.value!)}
              />
              
              <IonInput
                label="Password"
                type="password"
                labelPlacement="floating"
                fill="outline"
                className="auth-input"
                onIonChange={(e) => setPassword(e.detail.value!)}
              />
              
              <IonButton expand="block" className="auth-button" type="submit">
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
                onIonChange={(e) => setEmail(e.detail.value!)}
              />
              
              <IonInput
                label="Password"
                type="password"
                labelPlacement="floating"
                fill="outline"
                className="auth-input"
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
                <p>To keep connected please login with your personal info</p>
                <IonButton 
                  fill="outline" 
                  className="ghost" 
                  onClick={() => setIsSignUpActive(false)}
                >
                  Sign In
                </IonButton>
              </div>
              
              <div className="overlay-panel overlay-right">
                <h2>Hello, Friend!</h2>
                <p>Enter your personal details and start journey with us</p>
                <IonButton 
                  fill="outline" 
                  className="ghost" 
                  onClick={() => setIsSignUpActive(true)}
                >
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