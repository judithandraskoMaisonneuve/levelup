import { db } from '../Firebase'; 
import { collection, addDoc } from 'firebase/firestore';

const badgesList: Record<string, { image: string; description: string }> = {
  "Welcome": { 
      image: "https://i.imgur.com/UeymW9F.png", 
      description: "Earned by signing up for the first time!" 
  },
  "Golden Fish": { 
      image: "https://i.imgur.com/SEHWpjt.png", 
      description: "Awarded for logging all mood types !" 
  },
  "Grumpy Cat Streak": { 
      image: "https://i.imgur.com/QujcxGg.png", 
      description: "Given for logging 3+ consecutive bad mood days." 
  },
  "Purrfectly Happy": { 
      image: "https://i.imgur.com/WorT3ow.png", 
      description: "Unlocked when you've had a streak of 5+  happy moods!" 
  },
  "Sardine League": { 
      image: "https://i.imgur.com/KWVMfsP.png", 
      description: "Congratulations! You've entered the Sardine League." 
  },
  "Trout League": { 
      image: "https://i.imgur.com/LjPx1BR.png", 
      description: "You've leveled up to the Trout League!" 
  },
  "Salmon League": { 
      image: "https://i.imgur.com/un8Q0PG.png", 
      description: "Your progress has brought you to the Salmon League!" 
  },
  "Tuna League": { 
      image: "https://i.imgur.com/tzDmfvB.png", 
      description: "Top of the leaderboard! Welcome to the Tuna League!" 
  },
};

export default badgesList;

export const gainBadge = async (badgeName: string, userId: string) => {
  if (!badgesList[badgeName]) {
      console.error(`Badge "${badgeName}" does not exist.`);
      return;
  }

  const { image, description } = badgesList[badgeName]; 

  try {
      await addDoc(collection(db, "users", userId, "badges"), {
          name: badgeName,
          imageUrl: image, 
          description: description, 
          earnedAt: new Date(),
      });
      console.log(`Badge "${badgeName}" earned for user ${userId}`);
  } catch (error) {
      console.error("Error adding badge: ", error);
  }
};
