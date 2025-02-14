import { IonContent, IonHeader, IonPage, IonButtons, IonBackButton } from '@ionic/react';
import './Moodtracker.css';
import DiarylogContainer from '../components/DiarylogContainer';
import { getOrdinalSuffix } from '../utils/datesuffix';
import { palette } from '../theme/palette';

const Diarylog: React.FC = () => {
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
                <h1 className="custom-title">{formattedDate}’s Diary Log</h1>
            </IonHeader>
            <IonContent className="diary-content" fullscreen >
               <DiarylogContainer/>
            </IonContent>
        </IonPage>
    );
};

export default Diarylog;
