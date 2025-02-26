import { IonModal} from '@ionic/react';
import "./LeagueDialog.css";

const leagues: Record<string, string> = {
    Sardine: "https://i.imgur.com/vQFy3RO.png",
    Trout: "https://i.imgur.com/WPBTHPi.png",
    Salmon: "https://i.imgur.com/4BkBcUU.png",
    Tuna: "https://i.imgur.com/rkZgfgH.png"
};

interface LeagueDialogProps {
    league: string | null;
    showDialog: boolean;
    setShowDialog: (val: boolean) => void;
}

const LeagueDialog: React.FC<LeagueDialogProps> = ({ league, showDialog, setShowDialog }) => {
    if (!league) return null;

    return (
        <IonModal 
            isOpen={showDialog} 
            onDidDismiss={() => setShowDialog(false)} 
            className="league-dialog" 
            backdropDismiss={true} 
        >
            <div className="league-dialog-content">
                <div className='league-dialog-text'>
                    <h2>Congratulations!</h2>
                    <p>You've reached the <b>{league}</b> league!</p>
                </div>
                <img src={leagues[league]} alt={league} className="league-image" />
                <button className='league-dialog-btn'  onClick={() => setShowDialog(false)}>Close</button>
            </div>
        </IonModal>
    );
};

export default LeagueDialog;
