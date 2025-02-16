import { IonContent, IonHeader, IonPage, IonButtons, IonBackButton } from '@ionic/react';
import './Moodtracker.css';
import DiarylogContainer from '../components/DiarylogContainer';
import { getOrdinalSuffix } from '../utils/datesuffix';
import { palette } from '../theme/palette';
import { useLocation } from 'react-router-dom';

const Diarylog: React.FC = () => {
    const today = new Date();
    const month = today.toLocaleDateString('en-US', { month: 'long' });
    const day = today.getDate();
    const formattedDate = `${month} ${getOrdinalSuffix(day)}`;

    const location = useLocation();
    const moodColor = location.state?.moodColor || palette.main;


    return (
        <IonPage>
            <IonHeader className="mood-toolbar" style={{ backgroundColor: moodColor }}>
                <IonButtons slot="start">
                    <IonBackButton default-href="/moodtracker"></IonBackButton>
                </IonButtons>
                <h1 className="mood-custom-title">{formattedDate}’s Diary Log</h1>
            </IonHeader>
            <IonContent className="diary-content" fullscreen style={{ backgroundColor: moodColor }}>
                <DiarylogContainer moodColor={moodColor} />
            </IonContent>
        </IonPage>
    );
};

export default Diarylog;
