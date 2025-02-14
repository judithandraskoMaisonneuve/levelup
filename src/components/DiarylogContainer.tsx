import { useEffect, useRef } from 'react';
import { IonButton } from '@ionic/react';
import './DiarylogContainer.css';

interface ContainerProps {
    moodColor: string;
}

const DiarylogContainer: React.FC<ContainerProps> = ({ moodColor }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    return (
        <div id="container" style={{ backgroundColor: moodColor }}>
            <div id="content" className="fade-in">
                <h2 className="diary-header-animate">What's got you feeling this way?</h2>
                <div className="diary-loging">
                    <textarea ref={textareaRef} className="diary-entry" placeholder="Write your thoughts here..."></textarea>
                </div>
                <div className="diary-button-group">
                    <IonButton className="log-button">Log Diary</IonButton>
                </div>
            </div>
        </div>
    );
};

export default DiarylogContainer;
