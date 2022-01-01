import React, {useEffect, useState} from "react";
import useLoggedin from "../hooks/useLoggedin";
import Login from "../component/Login";
import {QueryClient, QueryClientProvider, useQuery} from "react-query";
import Entries from "./components/Entries";
import {getDomain, getInherentDomain} from "../common";
import {
    CircularProgress,
    Container
} from "@mui/material";
import Scores from "./components/Scores";
import ScoreAppBar from "./components/ScoreAppBar";
import {Domain} from "../../database/types/domain";
import EntryList from "../component/EntryList";
import ThemedWrapper from "./components/ThemeWrapper";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

export default function () {
    return (
        <QueryClientProvider client={queryClient}>
            <LoginWall />
        </QueryClientProvider>
    );
}

type LoginWallProps = {
    domainId?: number
}

function LoginWall({domainId}: LoginWallProps) {
    const {isLoading: loadingDomain, data: domain, error} = useQuery('domain', domainId ? getDomain.bind(null, domainId) : getInherentDomain);
    const {isLoading: loadingUser, isLoggedIn, user} = useLoggedin();

    useEffect(() => {
        document.title = domain ? domain.name : "Score App Loading...";
    }, [domain]);

    if (loadingUser || loadingDomain) {
        return <CircularProgress/>;
    }

    if (error) {
        return <h1>Error</h1>;
    }

    if(!isLoggedIn || !user) {
        return <ThemedWrapper domainId={domain?.id as number}>
            <Login queryClient={queryClient}/>
        </ThemedWrapper>;
    }

    return <ThemedWrapper domainId={domain?.id as number}>
        <LoggedInView domain={domain} loading={loadingDomain}/>
    </ThemedWrapper>;
}

type LoggedInViewProps = {
    domain?: Domain,
    loading: boolean
};

function LoggedInView({domain, loading}: LoggedInViewProps) {
    const [uiSelector, setUiSelector] = React.useState(0);

    if (loading) {
        return <CircularProgress/>;
    }

    if (!domain) {
        return <h1>Error</h1>;
    }

    return <>
        <ScoreAppBar domain={domain} queryClient={queryClient}/>
        <Container maxWidth="md" sx={{paddingTop: '16px', flexGrow: 1, overflow: 'auto'}}>
            <AppContent selector={uiSelector} setSelector={setUiSelector} domain={domain}  queryClient={queryClient}/>
        </Container>
        <BottomNav domain={domain} selector={uiSelector} setSelector={setUiSelector}/>
    </>;
}

type AppContentProps = {
    selector: number,
    setSelector: (arg: number) => void
    domain: Domain,
    queryClient: QueryClient
}

function AppContent({selector, setSelector, domain, queryClient}: AppContentProps) {
    const [entry, setEntry] = useState<number | undefined>();

    switch(selector) {
        case 0:
            return <Entries domain={domain} entryId={entry} queryClient={queryClient}/>;
        case 1:
            return <EntryList domain={domain} jump={(id) => {
                setSelector(0);
                setEntry(id);
                setTimeout(setEntry.bind(null, undefined), 10);
            }}/>;
        case 2:
            return <Scores domain={domain}/>;
    }

    return <h6>Unknown Selector</h6>;
}