import {Box, Card, CardContent, CircularProgress, Divider, Slider, Stack, Typography} from "@mui/material";
import React, {useMemo} from "react";
import {Entry} from "../../../database/types/entry";
import {Domain} from "../../../database/types/domain";
import {useQuery} from "react-query";
import {getUser} from "../../common";
import {useForm, Controller} from "react-hook-form";
import {getAnswers, setAnswer} from "../entries";
import {Answer} from "../../../database/types/answer";
import useLoggedin from "../../hooks/useLoggedin";

type Rank = {
    name: string;
    min: number;
    max: number;
}

type RankFormProps = {
    domain: Domain,
    entry: Entry,
    index: number,
    rank: Rank,
    answers?: Answer[]
}

function RankForm({domain, entry, index, rank, answers}: RankFormProps) {
    const { register, handleSubmit, control, formState: { errors }, reset} = useForm<Answer>({
        mode: 'onChange',
        context: {
            entry
        }
    });
    //reset form on context change
    useMemo(() => reset(), [entry, domain]);
    const {user: loggedInAs} = useLoggedin();

    const onSubmit = (answer:Answer) => {
        if (domain && typeof domain.id != "undefined") {
            setAnswer(domain.id, answer);
        }
    }

    const current = answers ? answers.find(({rank}) => rank == index)?.value : 0;

    return <form onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>{rank.name}</Typography>
        <Controller
            name="value"
            control={control}
            defaultValue={current}
            render={({field}) => (
                <Slider
                    ref={field.ref}
                    name={field.name}
                    value={field.value as number || current || 0}
                    valueLabelDisplay="auto"
                    onChange={(_, value) => {
                        field.onChange(value);
                    }}
                    onChangeCommitted={(_, value) => {
                        handleSubmit(onSubmit)();
                    }}
                    step={1}
                    style={{paddingTop: 0}}
                    marks
                    min={rank ? rank.min : 0}
                    max={rank ? rank.max : 100}
                />
            )}
        />
        <input type="hidden" value={loggedInAs?.id} {...register('user', {required: true, valueAsNumber: true})}/>
        <input type="hidden" value={entry.id} {...register('entry', {required: true, valueAsNumber: true})}/>
        <input type="hidden" value={index} {...register('rank', {required: true, valueAsNumber: true})}/>
    </form>;
}

type EntityProps = {
    entry: Entry,
    domain: Domain,
}

export default function Entry({entry, domain}: EntityProps) {
    const {isLoading, data: user, error} = useQuery(`user-${entry.owner}`, getUser.bind(null, entry.owner));
    const {data: answers} = useQuery(`answers-${entry.id}`, getAnswers.bind(null, domain.id || 0, entry.id || 0));

    if(isLoading) {
        return <CircularProgress/>;
    }

    if(error || !entry || !user) {
        return <h1>Error</h1>;
    }

    return <Card elevation={4} style={{backgroundColor: "transparent"}}>
        <CardContent>
            <Box pb={2}>
                <Typography variant="body1" fontStyle="italic" color="text.secondary" component="div" pb={3.5}>{entry?.team || user?.name}</Typography>
                <Typography variant="h5">{entry?.name}</Typography>
                <Typography variant="body2" color="text.secondary">{entry?.description}</Typography>
            </Box>
            <Divider variant="middle"/>
            <Box pt={2}>
                <ScoreRanks domain={domain} entry={entry} answers={answers}/>
            </Box>
            <Typography variant="body2" align="center" color="text.secondary">{getDisplayIndex(entry?.index)}</Typography>
        </CardContent>
    </Card>;
}

type ScoreRanksProps = {
    domain: Domain,
    entry: Entry,
    answers: Answer[] | undefined
};

function ScoreRanks({domain, entry, answers}: ScoreRanksProps) {
    const {user} = useLoggedin();

    if(domain.disableScoring) {
        return <Typography variant="h6" align="center">
            Scoring is not enabled at this time, please check back later!
        </Typography>
    }

    if (entry.owner === user?.id && !domain.scoreOwnEntry) {
        return <Typography variant="h6">
            This is yours! you can sit back and take the praise
        </Typography>
    }

    return <Stack>{
        domain.ranks.map((rank, i) => <RankForm key={`rank-${i}`} domain={domain} entry={entry} index={i} rank={rank} answers={answers}/>)
    }</Stack>;
}

function getDisplayIndex(index: number = 0) : string{
    const string = index.toString();

    if(string.length < 2) {
        return `0${index}`;
    }

    return string;
}