import { useState } from 'react';
import { IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { auth, db } from '../Firebase'; 
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import './MoodtrackerContainer.css';

interface ContainerProps {
  moodColors: Record<string, string>;
  setSelectedMood: (mood: string) => void;
}

const MoodtrackerContainer: React.FC<ContainerProps> = ({ moodColors, setSelectedMood }) => {
  const moods = [
    { name: 'Calm', image: 'src/resources/cat-calm.png' },
    { name: 'Happy', image: 'src/resources/cat-happy.png' },
    { name: 'Excited', image: 'src/resources/cat-excited.png' },
    { name: 'Sad', image: 'src/resources/cat-sad.png' },
    { name: 'Grateful', image: 'src/resources/cat-grateful.png' },
    { name: 'Angry', image: 'src/resources/cat-angry.png' }
  ];

  const [selectedMood, setSelectedMoodLocal] = useState(moods[0]);
  const [animationKey, setAnimationKey] = useState(0);
  const history = useHistory();

  const handleMoodClick = (mood: typeof moods[number]) => {
    if (mood.name !== selectedMood.name) {
      setSelectedMoodLocal(mood);
      setSelectedMood(mood.name);
      setAnimationKey((prevKey) => prevKey + 1);
    }
  };

  const saveMoodToFirestore = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error("No user logged in");
      return;
    }

    try {
      await addDoc(collection(db, "moodLogs"), {
        userId: user.uid,
        mood: selectedMood.name,
        moodColor: moodColors[selectedMood.name],
        timestamp: new Date()
      });
      console.log("Mood logged successfully");
    } catch (error) {
      console.error("Error logging mood:", error);
    }
  };

  const navigateToDiaryLog = () => {
    history.push('/diarylog', { moodColor: moodColors[selectedMood.name] });
  };

  console.log("Rendering MoodtrackerContainer...");

  return (
    <div id="container" style={{ backgroundColor: moodColors[selectedMood.name] || "var(--main)" }}>
      <h2>How are you today?</h2>
      <img
        key={animationKey}
        src={selectedMood.image}
        alt={`${selectedMood.name} Cat`}
        className="mood-image bubble-animation"
      />
      <div className="mood-buttons">
        {moods.map((mood) => (
          <IonButton
            key={mood.name}
            className={`mood-button ${selectedMood.name === mood.name ? 'selected' : ''}`}
            onClick={() => handleMoodClick(mood)}
          >
            {mood.name}
          </IonButton>
        ))}
      </div>
      <div className="button-group">
        <IonButton className="save-button" onClick={saveMoodToFirestore}>
          Save
        </IonButton>
        <IonButton className="log-diary-button" onClick={navigateToDiaryLog}>
          Log Diary
        </IonButton>
      </div>
    </div>
  );
};

export default MoodtrackerContainer;
