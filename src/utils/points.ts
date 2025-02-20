import { db } from '../Firebase';
import { collection, addDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { useToast } from '../context/ToastContext';
import { useEffect, useState } from "react";  

export const useAddPoints = () => {
    const { showToast } = useToast();  // Getting the global toast function

    const addPoints = async (userId: string, pointsToAdd: number) => {
        if (!userId) {
            console.error("No user ID provided");
            return;
        }

        try {
            await addDoc(collection(db, "points"), {
                userId,
                points: pointsToAdd,
                timestamp: Timestamp.now()
            });
            console.log(`${pointsToAdd} points added for user ${userId}`);

            // Show toast globally
            showToast(`${pointsToAdd} pts gained!`);
        } catch (error) {
            console.error("Error adding points:", error);
        }
    };

    return { addPoints };
};



export const useUserPoints = (userId: string) => {
    const [totalPoints, setTotalPoints] = useState<number | null>(null);

    useEffect(() => {
        if (!userId) return;

        const fetchPoints = async () => {
            try {
                const pointsRef = collection(db, "points");
                const q = query(pointsRef, where("userId", "==", userId));
                const querySnapshot = await getDocs(q);

                let pointsSum = 0;
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.points) {
                        pointsSum += data.points;
                    }
                });

                setTotalPoints(pointsSum);
            } catch (error) {
                console.error("Error fetching points:", error);
                setTotalPoints(0); // default to 0 si il y a une error
            }
        };

        fetchPoints();
    }, [userId]);

    return totalPoints;
};

