import { db } from "../Firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { gainBadge } from "./badges"; 

const allMoods = ["Calm", "Happy", "Excited", "Sad", "Grateful", "Angry"];
const badMoods = ["Sad", "Angry"];
const happyMood = ["Happy", "Grateful", "Excited"];

export const checkAndAwardBadges = async (userId: string) => {
  try {
    // Fetch user's mood logs from Firestore
    const moodsRef = collection(db, "users", userId, "moodLogs");
    const moodQuery = query(moodsRef, orderBy("timestamp", "asc"));
    const moodSnapshot = await getDocs(moodQuery);

    if (moodSnapshot.empty) return;

    const moodLogs = moodSnapshot.docs.map(doc => doc.data().mood);
    const uniqueMoods = new Set(moodLogs);
    
    // 1️Check for "Golden Fish" (if all moods have been logged at least once)
    if (allMoods.every(mood => uniqueMoods.has(mood))) {
      await gainBadge("Golden Fish", userId);
    }

    // Check for "Grumpy Cat Streak" (if last 3 logs are bad moods)
    if (moodLogs.length >= 3) {
      const lastThreeMoods = moodLogs.slice(-3);
      if (lastThreeMoods.every(mood => badMoods.includes(mood))) {
        await gainBadge("Grumpy Cat Streak", userId);
      }
    }

    // Check for "Purrfectly Happy" (if last 5 logs are "Happy")
    if (moodLogs.length >= 5) {
      const lastFiveMoods = moodLogs.slice(-5);
      if (lastFiveMoods.every(mood => mood === happyMood)) {
        await gainBadge("Purrfectly Happy", userId);
      }
    }

  } catch (error) {
    console.error("Error checking badges:", error);
  }
};
