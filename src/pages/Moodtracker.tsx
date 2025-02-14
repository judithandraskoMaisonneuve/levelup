import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton } from '@ionic/react';
import './Moodtracker.css';
import MoodtrackerContainer from '../components/MoodtrackerContainer';
import { getOrdinalSuffix } from '../utils/datesuffix';

const MoodTracker: React.FC = () => {
    // Get today's date in a written format (e.g., "February 14th")
    const today = new Date();
    const month = today.toLocaleDateString('en-US', { month: 'long' }); 
    const day = today.getDate(); 
    const formattedDate = `${month} ${getOrdinalSuffix(day)}`;
    
    return (
        <IonPage>
            <IonHeader className="custom-toolbar">
                <IonButtons slot="start">
                    <IonBackButton default-href="#"></IonBackButton>
                </IonButtons>
                <h1 className="custom-title">{formattedDate}’s Mood Diary</h1>
            </IonHeader>
            <IonContent className="mood-content" fullscreen>
                <MoodtrackerContainer/>
            </IonContent>
        </IonPage>
    );
};

export default MoodTracker;