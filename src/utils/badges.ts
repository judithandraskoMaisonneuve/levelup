import { db } from '../Firebase'; 
import { collection, addDoc } from 'firebase/firestore';

const badgesList: Record<string, string> = {
    "Welcome": "https://i.imgur.com/UeymW9F.png",
    "Golden Fish": "https://i.imgur.com/SEHWpjt.png",
    "Grumpy Cat Streak": "https://i.imgur.com/QujcxGg.png",
    "Purrfectly Happy": "https://i.imgur.com/WorT3ow.png",
    "Sardine League": "https://i.imgur.com/KWVMfsP.png",
    "Trout League": "https://i.imgur.com/LjPx1BR.png",
    "Salmon League": "https://i.imgur.com/un8Q0PG.png",
    "Tuna League": "https://i.imgur.com/tzDmfvB.png",
};

export default badgesList;

export const gainBadge = async (badgeName: string, userId: string) => {
    if (!badgesList[badgeName]) {
      console.error(`Badge "${badgeName}" does not exist.`);
      return;
    }
  
    try {
      await addDoc(collection(db, "users", userId, "badges"), {
        name: badgeName,
        imageUrl: badgesList[badgeName],
        earnedAt: new Date(),
      });
      console.log(`Badge "${badgeName}" earned for user ${userId}`);
    } catch (error) {
      console.error("Error adding badge: ", error);
    }
  };
