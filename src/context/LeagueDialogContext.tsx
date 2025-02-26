import React, { createContext, useContext, useState } from "react";
import LeagueDialog from "../components/LeagueDialog";

interface LeagueDialogContextProps {
    showLeagueDialog: (league: string) => void;
}

const LeagueDialogContext = createContext<LeagueDialogContextProps | undefined>(undefined);

export const LeagueDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [league, setLeague] = useState<string | null>(null);
    const [showDialog, setShowDialog] = useState<boolean>(false);

    const showLeagueDialog = (newLeague: string) => {
        setLeague(newLeague);
        setShowDialog(true);
    };

    return (
        <LeagueDialogContext.Provider value={{ showLeagueDialog }}>
            {children}
            <LeagueDialog league={league} showDialog={showDialog} setShowDialog={setShowDialog} />
        </LeagueDialogContext.Provider>
    );
};

export const useLeagueDialog = () => {
    const context = useContext(LeagueDialogContext);
    if (!context) {
        throw new Error("useLeagueDialog must be used within a LeagueDialogProvider");
    }
    return context;
};
