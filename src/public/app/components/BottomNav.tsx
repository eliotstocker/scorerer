import {Domain} from "../../../database/types/domain";
import {BottomNavigation, BottomNavigationAction} from "@mui/material";
import {CheckCircleOutline, EmojiEvents, MenuBook} from "@mui/icons-material";
import React from "react";

type BottomBarProps = {
    domain: Domain,
    selector: number,
    setSelector: (arg0: number) => void
}

export default function BottomNav({domain, selector, setSelector}: BottomBarProps) {
    return <BottomNavigation
        showLabels
        value={selector}
        onChange={(event, newValue) => {
            setSelector(newValue);
        }}
    >
        <BottomNavigationAction label="Scoring" icon={<CheckCircleOutline />} />
        <BottomNavigationAction label="Entries" icon={<MenuBook />} />
        <BottomNavigationAction label="Results" icon={<EmojiEvents/>} disabled={!domain.showResults} style={{opacity: domain.showResults ? 1 : 0.3}}/>
    </BottomNavigation>
}