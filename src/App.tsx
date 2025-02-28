import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { applyPalette } from './theme/palette';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './Firebase'; 
import Home from './pages/Home';
import Moodtracker from './pages/Moodtracker';
import Diarylog from './pages/Diarylog';
import FriendsPage from './pages/Friends/Friends';
import Profile from './pages/Profile';
import { AuthPage } from './pages/AuthPage/AuthPage';
import { ToastProvider } from './context/ToastContext';
import { ScoreboardPage } from './pages/Scoreboard/Scoreboard';
import { LeagueDialogProvider } from './context/LeagueDialogContext';
import Badges from './pages/Badges';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';

setupIonicReact();
applyPalette();

const App: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  //Loading screen
  if (loading) return (
    <div className="loading-screen" >
      <img className="loading-logo" src="src/resources/logo-levelup-bluebg.png" />
      <div className="loading-spinner"></div>
    </div>); 

  return (
    <ToastProvider>
      <LeagueDialogProvider>
      <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/authpage">
            {userId ? <Redirect to={`/home/${userId}`} /> : <AuthPage />}
          </Route>
          
          <Route exact path="/">
            {userId ? <Redirect to={`/home/${userId}`} /> : <Redirect to="/authpage" />}
          </Route>

          <PrivateRoute userId={userId} path="/home/:id" component={Home} />
          <PrivateRoute userId={userId} path="/moodtracker/:id" component={Moodtracker} />
          <PrivateRoute userId={userId} path="/diarylog/:id" component={Diarylog} />
          <PrivateRoute userId={userId} path="/friends/:id" component={FriendsPage} />
          <PrivateRoute userId={userId} path="/profile/:id" component={Profile} />
          <PrivateRoute userId={userId} path="/scoreboard/:id" component={ScoreboardPage} />
          <PrivateRoute userId={userId} path="/badges/:id" component={Badges} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
    </LeagueDialogProvider>

    </ToastProvider>
    
  );
};

interface PrivateRouteProps {
  userId: string | null;
  path: string;
  component: React.ComponentType<any>;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ userId, path, component: Component }) => (
  <Route exact path={path}>
    {userId ? <Component userId={userId} /> : <Redirect to="/authpage" />}
  </Route>
);

export default App;
