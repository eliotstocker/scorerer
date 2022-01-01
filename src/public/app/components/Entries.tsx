import {QueryClient, useQuery} from "react-query";
import {getDomainEntries} from "../../common";
import {Button, CircularProgress, Grid, MobileStepper, Typography, useMediaQuery, useTheme} from "@mui/material";
import React, {useMemo, useState} from "react";
import {Entry as Ent} from "../../../database/types/entry";
import {Domain} from "../../../database/types/domain";
import Entry from "./Entry";
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import {KeyboardArrowLeft, KeyboardArrowRight} from "@mui/icons-material";
import EntryModal from "./EntryModal";

type EntriesProps = {
    domain: Domain,
    entryId: number | undefined,
    queryClient: QueryClient
};

function useEntry(entries: undefined | Ent[]) : [Ent | undefined, number, boolean, boolean, () => void, () => void, (arg:number) => void] {
    const [entryIndex, setEntry] = useState(0);

    const hasNext = !!entries && entries.length > 0 && entryIndex < (entries.length -1);
    const hasPrevious = !!entries && entries.length > 0 && entryIndex > 0;

    const entry = entries && entries[entryIndex];

    const jumpTo = (id: number) => {
        const index = entries?.findIndex(entry => {
            return entry?.id === id;
        });

        if(typeof index != "undefined" && index > -1) {
            setEntry(index);
        }
    };

    const next = () => entries && entryIndex < (entries.length -1) && setEntry(entryIndex + 1);
    const previous = () => entryIndex > 0 && setEntry(entryIndex -1);

    return [entry, entryIndex, hasNext, hasPrevious, next, previous, jumpTo];
}

export default function Entries({domain, entryId, queryClient}: EntriesProps) {
    const {isLoading, data, error} = useQuery(`entries-${domain.id}`, (domain && typeof domain.id != "undefined") ? getDomainEntries.bind(null, domain.id) : () => []);
    const [entry, index, hasNext, hasPrevious, next, previous, jumpTo] = useEntry(data);
    const [entryModalOpen, setEntryModalOpen] = useState(false);
    useMemo(() => typeof entryId != "undefined" && jumpTo(entryId), [entryId]);

    const theme = useTheme();
    const medium = useMediaQuery(theme.breakpoints.up('md'));

    const [{ x }, api] = useSpring(() => ({ x: 0, y: 0 }));
    const bind = useDrag(({down, movement: [mx], swipe: [swipeX]}) => {
        if (swipeX > 0 && hasPrevious) {
            previous();
            api.set({x: -mx});
        }
        if (swipeX < 0 && hasNext) {
            next();
            api.set({x: -mx});
        }
        api.start({x: down ? mx : 0, immediate: down});
    }, { axis: 'x' });

    if(isLoading) {
        return <CircularProgress/>
    }

    if(error) {
        return <h1>Error</h1>
    }

    if(!data || data.length < 1 || !entry) {
        return <>
            <Typography variant="h6" align="center" color="text.secondary" gutterBottom pt={10}>
                There are no Entries yet...<br/>
            </Typography>
            {domain.allowUserEntries && <>
                <Grid container justifyContent="center">
                    <Button variant="contained" onClick={setEntryModalOpen.bind(null, true)}>Add New Entry</Button>
                </Grid>
                <EntryModal open={entryModalOpen} handleClose={setEntryModalOpen.bind(null, false)} queryClient={queryClient} domain={domain}/>
            </>}
        </>;
    }

    return <>
        <animated.div {...bind()} style={{ x, touchAction: 'none' }} >
            <Entry entry={entry} domain={domain}/>
        </animated.div>
        <MobileStepper
            style={{background: "transparent"}}
            steps={data.length}
            position="static"
            activeStep={index}
            nextButton={
                <Button size="small" onClick={next} disabled={!hasNext}>
                    {medium && 'Next'} <KeyboardArrowRight />
                </Button>
            }
            backButton={
                <Button size="small" onClick={previous} disabled={!hasPrevious}>
                    <KeyboardArrowLeft /> {medium && 'Previous'}
                </Button>
            }
        />
        {domain.allowUserEntries && <>
            <Typography align="center" color="text.secondary" gutterBottom pt={5}>
                Need to add your own entry?
            </Typography>
            <Grid container justifyContent="center">
                <Button variant="outlined" size="small" color="secondary" onClick={setEntryModalOpen.bind(null, true)}>Add New Entry</Button>
            </Grid>
            <EntryModal open={entryModalOpen} handleClose={setEntryModalOpen.bind(null, false)} queryClient={queryClient} domain={domain}/>
        </>}
    </>;
}