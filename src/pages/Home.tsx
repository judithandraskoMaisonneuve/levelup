import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Home.css';
import DashboardContainer from '../components/DashboardContainer';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader id='home-header'>
        <IonToolbar className="home-toolbar">
          <div className="home-toolbar-content">
            {/* User Profile */}
            <div className="user-info">
              <img src="src/resources/pfp-cat-nobg.png" alt="Profile" className="profile-pic" />
              <span className="username">@example</span>
            </div>

            {/* User Stats */}
            <div className="user-stats">
              <div className="streak">
                <img src="src/resources/icon-flame-nobg.png" alt="Streak" className="icon" />
                <span>3</span>
              </div>
              <div className="points">
                <img src="src/resources/icon-sardine-nobg.png" alt="Sardine Can" className="icon" />
                <span>42 pts</span>
              </div>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <DashboardContainer/>
      </IonContent>
    </IonPage>
  );
};

export default Home;
