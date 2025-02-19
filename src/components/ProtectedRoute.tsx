//
// 
//  PAS ENCORE UTILISE IL Y A DES PROBLEM AND L'APPARITION DU CONTENU DES PAGE QUAND JE PROTEGE LES ROUTES

import { Redirect, Route, RouteProps } from 'react-router-dom';
import { auth } from '../Firebase';
import { useEffect, useState, ComponentType } from 'react';

interface ProtectedRouteProps extends RouteProps {
  component: ComponentType<any>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; 
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to="/authpage" />
        )
      }
    />
  );
};

export default ProtectedRoute;

/* CHANGEMENT A APPORTER A APP.TSX
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { applyPalette } from './theme/palette';
import Home from './pages/Home';
import Moodtracker from './pages/Moodtracker';
import Diarylog from './pages/Diarylog';
import FriendsPage from './pages/Friends/Friends';
import { AuthPage } from './pages/AuthPage/AuthPage';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import { useEffect, useState } from 'react';
import { auth } from './Firebase';

setupIonicReact();
applyPalette();

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) return null; // Prevent flashing

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Redirect unauthenticated users }
          <Route exact path="/">
            {isAuthenticated ? <Redirect to="/home" /> : <Redirect to="/authpage" />}
          </Route>
          
          {/* Public Route }
          <Route exact path="/authpage">
            <AuthPage />
          </Route>

          {/* Protected Routes }
          <ProtectedRoute exact path="/home" component={Home} />
          <ProtectedRoute exact path="/moodtracker" component={Moodtracker} />
          <ProtectedRoute exact path="/diarylog" component={Diarylog} />
          <ProtectedRoute exact path="/friends" component={FriendsPage} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

*/