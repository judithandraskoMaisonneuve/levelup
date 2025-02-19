import { IonContent, IonHeader, IonPage, IonButtons, IonBackButton } from '@ionic/react';
import './Moodtracker.css';
import MoodtrackerContainer from '../components/MoodtrackerContainer';
import { getOrdinalSuffix } from '../utils/datesuffix';
import { palette } from '../theme/palette';
import { useState } from 'react';

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

    // State to track the selected mood
    const [selectedMood, setSelectedMood] = useState("Calm");

    return (
        <IonPage>
            <IonHeader className="mood-toolbar" style={{ backgroundColor: moodColors[selectedMood] }}>
                <IonButtons slot="start">
                    <IonBackButton default-href="#" />
                </IonButtons>
                <h1 className="mood-custom-title">{formattedDate}’s Mood Diary</h1>
            </IonHeader>
            <IonContent className="mood-content" fullscreen style={{ backgroundColor: moodColors[selectedMood] || "var(--main)" }}>
               <MoodtrackerContainer moodColors={moodColors} setSelectedMood={setSelectedMood} /> 
            </IonContent>
        </IonPage>
    );
};

export default MoodTracker;
