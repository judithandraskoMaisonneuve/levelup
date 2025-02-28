import { db } from '../Firebase';
import { collection, addDoc, Timestamp, query, where, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '../context/ToastContext';
import { useEffect, useState } from "react";
import { gainBadge } from './badges';

export const useUserStreak = (userId: string) => {
    const [currentStreak, setCurrentStreak] = useState<number>(0);
    const [highestStreak, setHighestStreak] = useState<number>(0);
    const [lastLoginDate, setLastLoginDate] = useState<Date | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        if (!userId) return;

        const checkAndUpdateStreak = async () => {
            try {
                // Get the user's streak document
                const streakRef = doc(db, "streaks", userId);
                const streakDoc = await getDoc(streakRef);
                
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Set to start of day for comparison
                
                if (streakDoc.exists()) {
                    const streakData = streakDoc.data();
                    const lastLogin = streakData.lastLoginDate?.toDate();
                    
                    if (lastLogin) {
                        lastLogin.setHours(0, 0, 0, 0); // Set to start of day for comparison
                        
                        // Calculate days difference
                        const diffTime = today.getTime() - lastLogin.getTime();
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                        
                        let newStreak = streakData.currentStreak || 0;
                        
                        // If last login was yesterday, increment streak
                        if (diffDays === 1) {
                            newStreak += 1;
                            showToast(`Streak: ${newStreak} days! 🔥`);
                        } 
                        // If last login was today, do nothing (maintain current streak)
                        else if (diffDays === 0) {
                            // Already logged in today, no change to streak
                        } 
                        // If more than 1 day has passed, reset streak
                        else if (diffDays > 1) {
                            newStreak = 1;
                            showToast(`New streak started! 🔥`);
                        }
                        
                        // Update highest streak if needed
                        const newHighestStreak = Math.max(newStreak, streakData.highestStreak || 0);
                        
                        // Update the streak document
                        await updateDoc(streakRef, {
                            currentStreak: newStreak,
                            highestStreak: newHighestStreak,
                            lastLoginDate: Timestamp.now()
                        });
                        
                        setCurrentStreak(newStreak);
                        setHighestStreak(newHighestStreak);
                        setLastLoginDate(today);
                    }
                } else {
                    // First time user logs in, create a new streak document
                    await setDoc(streakRef, {
                        userId,
                        currentStreak: 1,
                        highestStreak: 1,
                        lastLoginDate: Timestamp.now()
                    });
                    
                    setCurrentStreak(1);
                    setHighestStreak(1);
                    setLastLoginDate(today);
                    showToast(`Streak started! 🔥`);
                }
            } catch (error) {
                console.error("Error updating streak:", error);
                setCurrentStreak(0);
                setHighestStreak(0);
            }
        };
        
        checkAndUpdateStreak();
    }, [userId]);
    
    return { currentStreak, highestStreak, lastLoginDate };
};

// Optional: Add rewards for streak milestones
export const checkStreakRewards = async (userId: string, streak: number) => {
    try {
        // Define milestones that give points
        const milestones = [
            { days: 3, points: 3 },
            { days: 7, points: 5, badge: "7 Day Streak" },
            { days: 14, points: 10 },
            { days: 30, points: 15, badge: "30 Day Streak" }
        ];
        
        // Check if user hits any milestone
        const milestone = milestones.find(m => m.days === streak);
        
        if (milestone) {
            // Check if this milestone was already rewarded
            const rewardsRef = collection(db, "streakRewards");
            const q = query(
                rewardsRef, 
                where("userId", "==", userId),
                where("milestone", "==", milestone.days)
            );
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                // Add points reward
                await addDoc(collection(db, "points"), {
                    userId,
                    points: milestone.points,
                    reason: `${milestone.days}-day streak bonus`,
                    timestamp: Timestamp.now(),
                });
                
                //Milestone badge
                if (milestone.badge) {
                    await gainBadge(milestone.badge, userId);
                }
                
                // Record that this milestone was rewarded
                await addDoc(rewardsRef, {
                    userId,
                    milestone: milestone.days,
                    pointsAwarded: milestone.points,
                    timestamp: Timestamp.now()
                });
                
                return {
                    awarded: true,
                    milestone: milestone.days,
                    points: milestone.points
                };
            }
        }
        
        return { awarded: false };
    } catch (error) {
        console.error("Error checking streak rewards:", error);
        return { awarded: false, error };
    }
};

// Function to reset streak (for admin or debugging purposes)
export const resetUserStreak = async (userId: string) => {
    try {
        const streakRef = doc(db, "streaks", userId);
        await updateDoc(streakRef, {
            currentStreak: 0,
            lastLoginDate: Timestamp.now()
        });
        return true;
    } catch (error) {
        console.error("Error resetting streak:", error);
        return false;
    }
};

// Export streak milestone icons for UI display
export const streakMilestoneIcons: Record<number, string> = {
    3: "https://i.imgur.com/example3.png",
    7: "https://i.imgur.com/example7.png",
    14: "https://i.imgur.com/example14.png",
    30: "https://i.imgur.com/example30.png",
    60: "https://i.imgur.com/example60.png",
    90: "https://i.imgur.com/example90.png",
};