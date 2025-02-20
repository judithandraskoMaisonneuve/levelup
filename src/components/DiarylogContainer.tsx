import { useEffect, useRef, useState } from 'react';
import { IonButton } from '@ionic/react';
import './DiarylogContainer.css';
import { db } from '../Firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAddPoints } from '../utils/points';

interface ContainerProps {
    moodColor: string;
    userId: string;
}

const DiarylogContainer: React.FC<ContainerProps> = ({ moodColor, userId }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [entry, setEntry] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    //Points systenme
    const { addPoints } = useAddPoints();

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const handleInput = () => {
            textarea.style.height = 'auto';
            const isMobile = window.innerWidth <= 768;
            textarea.style.height = `${textarea.scrollHeight}px`;
            if (!isMobile) {
                textarea.style.width = `${Math.min(800, textarea.scrollWidth)}px`;
            }
        };

        textarea.addEventListener('input', handleInput);
        return () => textarea.removeEventListener('input', handleInput);
    }, []);

    const logDiaryEntry = async () => {
        if (!userId) {
            console.error("No user ID found");
            return;
        }
    
        if (!entry.trim()) return;
        setIsSaving(true);
    
        try {
            const docRef = await addDoc(collection(db, 'diaryEntries'), {
                userId,
                text: entry,
                moodColor,
                timestamp: Timestamp.now()
            });
    
            console.log("Diary logged successfully with ID:", docRef.id);
    
            // Add 5 points when logging a diary entry 
            await addPoints(userId, 5);
    
            setEntry('');
        } catch (error) {
            console.error('Error saving diary entry:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div id="container" style={{ backgroundColor: moodColor }}>
            <div id="content" className="fade-in">
                <h2 className="diary-header-animate" style={{color: "var(--text)"}}>What's got you feeling this way?</h2>
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
