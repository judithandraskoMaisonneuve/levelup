import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton } from '@ionic/react';
import './Moodtracker.css';
import MoodtrackerContainer from '../components/MoodtrackerContainer';
import { getOrdinalSuffix } from '../utils/datesuffix';
import { palette } from '../theme/palette';

const MoodTracker: React.FC = () => {
    const today = new Date();
    const month = today.toLocaleDateString('en-US', { month: 'long' });
    const day = today.getDate();
    const formattedDate = `${month} ${getOrdinalSuffix(day)}`;

    // Define a color mapping for moods
    const moodColors: Record<string, string> = {
        Calm: palette.main,
        Happy: palette.green,
        Excited: palette.yellow,
        Sad: palette.blue,
        Grateful: palette.pink,
        Angry: palette.red
    };

    return (
        <IonPage>
            <IonHeader className="custom-toolbar">
                <IonButtons slot="start">
                    <IonBackButton default-href="#"></IonBackButton>
                </IonButtons>
                <h1 className="custom-title">{formattedDate}’s Mood Diary</h1>
            </IonHeader>
            <IonContent className="mood-content" fullscreen style={{ backgroundColor: moodColors['Calm'] }}>
                <MoodtrackerContainer moodColors={moodColors} />
            </IonContent>
        </IonPage>
    );
};

export default MoodTracker;
