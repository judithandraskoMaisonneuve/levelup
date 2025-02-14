import { useState } from 'react';
import { IonButton } from '@ionic/react';
import './MoodtrackerContainer.css';
import { useHistory } from 'react-router-dom';

interface ContainerProps {}

const DiarylogContainer: React.FC<ContainerProps> = () => {
    return(
        <div id="container">
            <h2>What's got you feeling this way?</h2>
        </div>
    )
};
export default DiarylogContainer;