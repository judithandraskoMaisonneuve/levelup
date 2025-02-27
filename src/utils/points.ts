import { db } from '../Firebase';
import { collection, addDoc, Timestamp, query, where, getDoc, doc, setDoc } from 'firebase/firestore';
import { useToast } from '../context/ToastContext';
import { useEffect, useState } from "react";  
import { useLeagueDialog } from '../context/LeagueDialogContext';
import { gainBadge } from "./badges"; 

export const useAddPoints = () => {
    const { showToast } = useToast();
    const { showLeagueDialog } = useLeagueDialog();

    const addPoints = async (userId: string, pointsToAdd: number) => {
        if (!userId) {
            console.error("No user ID provided");
            return;
        }

        try {
            // Reference to the user's points document
            const pointsRef = doc(db, "users", userId);

            // Fetch the current total points
            const userDoc = await getDoc(pointsRef);
            let totalPoints = userDoc.exists() ? userDoc.data().totalPoints || 0 : 0;

            // New total after adding points
            const newTotalPoints = totalPoints + pointsToAdd;
            const oldLeague = determineLeague(totalPoints);
            const newLeague = determineLeague(newTotalPoints);

            // Update the user's total points in Firestore
            await setDoc(pointsRef, { totalPoints: newTotalPoints }, { merge: true });

            console.log(`${pointsToAdd} points added for user ${userId}`);

            // Show toast
            showToast(`${pointsToAdd} pts gained!`);

            // If the user moved to a new league, check if they've already seen the modal
            const lastSeenLeague = localStorage.getItem(`lastSeenLeague_${userId}`);

            if (newLeague !== oldLeague && lastSeenLeague !== newLeague) {
                showLeagueDialog(newLeague);
                localStorage.setItem(`lastSeenLeague_${userId}`, newLeague); 

                // Award league badge
                const leagueBadge = `${newLeague} League`; // Matches badge names
                await gainBadge(leagueBadge, userId);
            }
        } catch (error) {
            console.error("Error adding points:", error);
        }
    };

    return { addPoints };
};


export const useUserPoints = (userId: string) => {
    const [totalPoints, setTotalPoints] = useState<number | null>(null);
    const [league, setLeague] = useState<string | null>(null);
    const { showLeagueDialog } = useLeagueDialog();

    useEffect(() => {
        if (!userId) return;

        const fetchPoints = async () => {
            try {
                const pointsRef = doc(db, "users", userId);
                const userDoc = await getDoc(pointsRef);

                let pointsSum = userDoc.exists() ? userDoc.data().totalPoints || 0 : 0;
                setTotalPoints(pointsSum);

                const newLeague = determineLeague(pointsSum);

                // Get the last seen league from localStorage
                const lastSeenLeague = localStorage.getItem(`lastSeenLeague_${userId}`);

                // If the league has changed and it's not already shown, show the modal
                if (newLeague !== lastSeenLeague) {
                    setLeague(newLeague);
                    showLeagueDialog(newLeague);
                    localStorage.setItem(`lastSeenLeague_${userId}`, newLeague); // Save the new league in localStorage
                } else {
                    setLeague(newLeague); // Update the league state if it's the same league
                }

            } catch (error) {
                console.error("Error fetching points:", error);
                setTotalPoints(0);
                setLeague("Sardine");
            }
        };

        fetchPoints();
    }, [userId]);

    return { totalPoints, league };
};


const determineLeague = (points: number): string => {
    if (points >= 125) return "Tuna";
    if (points >= 75) return "Salmon";
    if (points >= 25) return "Trout";
    return "Sardine";
};

export const leagueImages: Record<string, string> = {
    "Sardine": "https://i.imgur.com/vQFy3RO.png",
    "Trout": "https://i.imgur.com/WPBTHPi.png",
    "Salmon": "https://i.imgur.com/4BkBcUU.png",
    "Tuna": "https://i.imgur.com/rkZgfgH.png",
  };
