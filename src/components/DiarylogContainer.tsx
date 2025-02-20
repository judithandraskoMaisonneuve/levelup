import { useEffect, useRef, useState} from 'react';
import { IonButton } from '@ionic/react';
import './DiarylogContainer.css';
import { auth, db } from '../Firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

interface ContainerProps {
    moodColor: string;
}

const DiarylogContainer: React.FC<ContainerProps> = ({ moodColor }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [entry, setEntry] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const handleInput = () => {
            textarea.style.height = 'auto'; 
            textarea.style.width = 'auto'; 
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                textarea.style.height = `${textarea.scrollHeight}px`; 
            } else {
                textarea.style.height = `${textarea.scrollHeight}px`; 
                textarea.style.width = `${Math.min(800, textarea.scrollWidth)}px`; 
            }
        };

        textarea.addEventListener('input', handleInput);
        return () => textarea.removeEventListener('input', handleInput);
    }, []);

    const logDiaryEntry = async () => {
        const user = auth.currentUser;
        if (!user) {
        console.error("No user logged in");
        return;
        }

        if (!entry.trim()) return;
        setIsSaving(true);
        try {
            await addDoc(collection(db, 'diaryEntries'), {
                text: entry,
                moodColor: moodColor,
                timestamp: Timestamp.now()
            });
            console.log("Diary logged successfully");
            setEntry(''); 
        } catch (error) {
            console.error('Error saving diary entry:', error);
        } finally {
            setIsSaving(false);
        }
    };

    console.log("Rendering DiarylogContainer...");
    return (
        <div id="container" style={{ backgroundColor: moodColor }}>
            <div id="content" className="fade-in">
                <h2 className="diary-header-animate">What's got you feeling this way?</h2>
                <div className="diary-loging">
                    <textarea 
                        ref={textareaRef} 
                        className="diary-entry" 
                        placeholder="Write your thoughts here..." 
                        value={entry} 
                        onChange={(e) => setEntry(e.target.value)}
                        disabled={isSaving}
                    ></textarea>
                </div>
                <div className="diary-button-group">
                    <IonButton className="log-button" onClick={logDiaryEntry} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Log Diary'}
                    </IonButton>
                </div>
            </div>
        </div>
    );
};

export default DiarylogContainer;