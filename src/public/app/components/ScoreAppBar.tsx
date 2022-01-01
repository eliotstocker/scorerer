import {AppBar, Toolbar, Typography, useTheme} from "@mui/material";
import React from "react";
import {Domain} from "../../../database/types/domain";
import UserEntriesMenu from "./UserEntriesMenu";
import {QueryClient} from "react-query";

type ScoreAppBarProps = {
    domain: Domain;
    queryClient: QueryClient
}

export default function ScoreAppBar({domain, queryClient}: ScoreAppBarProps) {
    const theme = useTheme();
    const padding = theme.spacing(2);

    return <AppBar position="static" color="transparent">
        <Toolbar>
            <Typography variant="h2" component="div" sx={{ flexGrow: 1 }}>{domain?.name}</Typography>
            <UserEntriesMenu queryClient={queryClient} domain={domain}/>
        </Toolbar>
        {domain?.description && <Typography variant="body1" color="text.secondary" gutterBottom pl={padding} pr={padding}>{domain?.description}</Typography>}
    </AppBar>
}