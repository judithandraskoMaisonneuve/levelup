import { useState } from 'react';
import { IonButton } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { db } from '../Firebase'; 
import { collection, addDoc } from 'firebase/firestore';
import './MoodtrackerContainer.css';
import { useAddPoints } from '../utils/points';

interface RouteParams {
  id: string;
}

interface ContainerProps {
  moodColors: Record<string, string>;
  setSelectedMood: (mood: string) => void;
}

const MoodtrackerContainer: React.FC<ContainerProps> = ({ moodColors, setSelectedMood }) => {
  const { id: userId } = useParams<RouteParams>(); 
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

  //Points systenme
  const { addPoints } = useAddPoints();

  const handleMoodClick = (mood: typeof moods[number]) => {
    if (mood.name !== selectedMood.name) {
      setSelectedMoodLocal(mood);
      setSelectedMood(mood.name);
      setAnimationKey((prevKey) => prevKey + 1);
    }
  };

  const saveMoodToFirestore = async () => {
    if (!userId) {
      console.error("No user ID found in URL");
      return;
    }

    try {
      await addDoc(collection(db, "moodLogs"), {
        userId,
        mood: selectedMood.name,
        moodColor: moodColors[selectedMood.name],
        timestamp: new Date()
      });
      console.log("Mood logged successfully");

      // Add 3 points when logging a mood
      await addPoints(userId, 3);

    } catch (error) {
      console.error("Error logging mood:", error);
    }
  };

  const navigateToDiaryLog = () => {
    saveMoodToFirestore(); 
    history.push(`/diarylog/${userId}`, { moodColor: moodColors[selectedMood.name] });
  };

  console.log("Rendering MoodtrackerContainer...");

  return (
    <div id="container" style={{ backgroundColor: moodColors[selectedMood.name] || "var(--main)" }}>
      <h2 style={{color: 'var(--text)'}}>How are you today?</h2>
      <img
        key={animationKey}
        src={selectedMood.image}
        alt={`${selectedMood.name} Cat`}
        className="mood-image bubble-animation"
      />
      <div className="mood-buttons">
        {moods.map((mood) => (
          <button
            key={mood.name}
            className={`mood-button ${selectedMood.name === mood.name ? 'selected' : ''}`}
            onClick={() => handleMoodClick(mood)}
          >
            {mood.name}
          </button>
        ))}
      </div>
      <div className="button-group">
        <button className="save-mood-button" onClick={saveMoodToFirestore}>
          Save
        </button>
        <button className="log-diary-button" onClick={navigateToDiaryLog}>
          Log Diary
        </button>
      </div>
    </div>
  );
};

export default MoodtrackerContainer;
