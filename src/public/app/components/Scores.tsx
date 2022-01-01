import React from "react";
import {Domain} from "../../../database/types/domain";
import {useQuery} from "react-query";
import {getScores, Scores} from "../entries";
import {
    CircularProgress,
    Typography, useTheme
} from "@mui/material";
import { ResponsiveBar } from '@nivo/bar';
import {Entry} from "../../../database/types/entry";
import {getUser, getUsers} from "../../common";
import useLoggedin from "../../hooks/useLoggedin";

type ScoresProps = {
    domain: Domain
}

export default function Scores({domain}: ScoresProps) {
    const {isLoading, error, data} = useQuery('scores', getScores.bind(null, domain.id || 0));

    if (isLoading) {
        return <CircularProgress/>;
    }

    return <>
        <Typography variant="h5" color="text.secondary" gutterBottom>
            Scores
        </Typography>
        <ScoreContent data={data} error={error} domain={domain}/>
    </>;
}

type ScoreContentProps = {
    data: Scores[] | undefined,
    error: any,
    domain: Domain
};

function ScoreContent({data, error, domain}: ScoreContentProps) {
    if (error) {
        return <Typography variant="h5" gutterBottom>
            Error
        </Typography>;
    }

    if (!data || data.length < 1) {
        return <Typography variant="h5" gutterBottom>
            Not enough score data to show scores yet.
        </Typography>;
    }

    return <div>
        <WinnerInfo entry={data[0].entry}/>
        {
            Object.keys(data[0].scores).map(item => (<BuildBar scores={data} scoreKey={item} key={item} domain={domain}/>))
        }
    </div>;
}

type WinnerInfoProps = {
    entry: Entry
};

function WinnerInfo({entry}: WinnerInfoProps) {
    const {data: winner} = useQuery(`user-${entry.owner}`, getUser.bind(null, entry.owner));
    const {user} = useLoggedin();

    if (winner && user && winner.id === user.id) {
        return <Typography variant="h3" gutterBottom>
            Congratulations! You Won!<br/>
            Take a Bow
        </Typography>;
    }

    return <Typography variant="h3" gutterBottom>
        Winner: {entry.name} ({entry.team || winner?.name})
    </Typography>
}

type BuildBar = {
    scores: Scores[],
    scoreKey: string,
    domain: Domain
}

function useGraphTheme() {
    const theme = useTheme();

    return {
        "textColor": theme.palette.text.primary,
        "axis": {
        "domain": {
            "line": {
                "stroke": theme.palette.divider,
                    "strokeWidth": 1
            }
        },
        "ticks": {
            "line": {
                "stroke": theme.palette.divider,
                    "strokeWidth": 1
            }
        }
    },
        "grid": {
        "line": {
            "stroke": theme.palette.divider,
                "strokeWidth": 1
        }
    }
    }
}

function BuildBar({scores, scoreKey, domain}: BuildBar) {
    const graphTheme = useGraphTheme();
    const {data: users} = useQuery('users', getUsers.bind(null, domain?.id || -1));

    const data = scores.map(({entry, scores}) => ({
        name: entry.team || users?.find(({id}) => id === entry.owner)?.name || "Unknown Entry",
        ...scores
    }));

    const displayKey = scoreKey && (scoreKey.charAt(0).toUpperCase() + scoreKey.slice(1));

    return <>
        <Typography variant="h6" gutterBottom>{displayKey} Score</Typography>
        <div style={{height: '250px', color: '#333333'}}>
            <ResponsiveBar
                data={data}
                theme={graphTheme}
                keys={[scoreKey]}
                indexBy="name"
                indexScale={{ type: 'band', round: true }}
                margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
                padding={0.4}
                colors={{"scheme":"category10"}}
                colorBy="indexValue"
                valueScale={{ type: "linear" }}
                animate={true}
                enableLabel={false}
                axisTop={null}
                axisRight={null}
                valueFormat=">-.4"
                axisLeft={{
                    legend: displayKey,
                    legendPosition: "middle",
                    legendOffset: -40,
                    tickValues: 5
                }}
            />
        </div>
    </>;
}