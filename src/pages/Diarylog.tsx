import { IonContent, IonHeader, IonPage, IonButtons, IonBackButton } from '@ionic/react';
import './Moodtracker.css';
import DiarylogContainer from '../components/DiarylogContainer';
import { getOrdinalSuffix } from '../utils/datesuffix';
import { palette } from '../theme/palette';
import { useParams, useLocation } from 'react-router-dom';

interface RouteParams {
    id: string;
}

const Diarylog: React.FC = () => {
    const { id: userId } = useParams<RouteParams>();
    const location = useLocation();
    const moodColor = location.state?.moodColor || palette.main;

    const today = new Date();
    const month = today.toLocaleDateString('en-US', { month: 'long' });
    const day = today.getDate();
    const formattedDate = `${month} ${getOrdinalSuffix(day)}`;

    return (
        <IonPage>
            <IonHeader className="mood-toolbar" style={{ backgroundColor: moodColor }}>
                <IonButtons slot="start">
                    <IonBackButton defaultHref={`/moodtracker/${userId}`} />
                </IonButtons>
                <h1 className="mood-custom-title">{formattedDate}’s Diary Log</h1>
            </IonHeader>
            <IonContent className="diary-content" fullscreen style={{ backgroundColor: moodColor }}>
                <DiarylogContainer moodColor={moodColor} userId={userId} />
            </IonContent>
        </IonPage>
    );
};

export default Diarylog;
