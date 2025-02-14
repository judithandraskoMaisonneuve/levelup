import { useState } from 'react';
import { IonButton } from '@ionic/react';
import './MoodtrackerContainer.css'

interface ContainerProps {}

const MoodtrackerContainer: React.FC<ContainerProps> = () => {
  const moods = [
    { name: 'Calm', image: 'src/resources/cat-calm.png' },
    { name: 'Happy', image: 'src/resources/cat-happy.png' },
    { name: 'Excited', image: 'src/resources/cat-excited.png' },
    { name: 'Sad', image: 'src/resources/cat-sad.png' },
    { name: 'Grateful', image: 'src/resources/cat-grateful.png' },
    { name: 'Angry', image: 'src/resources/cat-angry.png' }
  ];

  // Default to "Calm"
  const [selectedMood, setSelectedMood] = useState(moods[0]);

  const handleMoodClick = (mood: typeof moods[number]) => {
    setSelectedMood(mood);
  };

  return (
    <div id="container">
      <h2>How are you today?</h2>
      <img src={selectedMood.image} alt={`${selectedMood.name} Cat`} className="mood-image" />
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
        <IonButton className="save-button">Save</IonButton>
        <IonButton className="log-diary-button">Log Diary</IonButton>
      </div>
    </div>
  );
};

export default MoodtrackerContainer;
