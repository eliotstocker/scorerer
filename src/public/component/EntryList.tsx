import {Domain} from "../../database/types/domain";
import {QueryClient, useQuery} from "react-query";
import {getDomainEntries, getUsers} from "../common";
import {
    Button,
    CircularProgress,
    Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Typography
} from "@mui/material";
import React from "react";
import {Delete} from "@mui/icons-material";
import {Entry} from "../../database/types/entry";
import {deleteEntry} from "../admin/admin";

type EntryListProps = {
    domain: Domain,
    realUsers?: boolean,
    jump: (arg: number) => void,
    allowDeletion?: boolean,
    queryClient?: QueryClient
}

export default function EntryList({domain, realUsers = false, jump, allowDeletion, queryClient}: EntryListProps) {
    const {isLoading, data, error} = useQuery(`entries-${domain.id}`, (domain && typeof domain.id != "undefined") ? getDomainEntries.bind(null, domain.id) : () => []);
    const {data: users} = useQuery(`users`, (domain && typeof domain.id != "undefined") ? getUsers.bind(null, domain.id) : () => []);
    const [deleteEntry, setDeleteEntry] = React.useState<Entry | undefined>();

    if (isLoading) {
        return <CircularProgress/>
    }

    if (error) {
        return <h5>Error</h5>;
    }

    return <>
        <List>
            {
                data?.map(entry => {
                    const user = users?.find(user => user.id === entry.owner);

                    return <ListItem key={`entry-${entry?.id}`} onClick={jump.bind(null, entry?.id as number)}>
                    <ListItemText primary={
                        <Typography variant="body1" fontStyle="italic" color="text.secondary" component="div">{entry?.team || user?.name} {realUsers && entry?.team ? `(${user?.name})` : ''}</Typography>
                    } secondary={
                        <Grid container>
                            <Grid item flexGrow="1">
                                <Typography variant="h5">{entry?.name}</Typography>
                                {entry?.description && <Typography variant="body2" color="text.secondary">{entry?.description}</Typography>}
                            </Grid>
                            {allowDeletion && <Grid item>
                                <IconButton edge="end" aria-label="delete" onClick={setDeleteEntry.bind(null, entry)}>
                                    <Delete/>
                                </IconButton>
                            </Grid>}
                        </Grid>
                    } />
                </ListItem>
                })
            }
        </List>
        {allowDeletion && <EntryDeletion
            domain={domain} entry={deleteEntry}
            open={typeof deleteEntry != "undefined"}
            close={setDeleteEntry.bind(null, undefined)}
            queryClient={queryClient}
        />}
    </>
}

type EntryDeletionProps = {
    domain: Domain,
    entry?: Entry,
    open: boolean,
    close: () => void,
    queryClient?: QueryClient
};

function EntryDeletion({domain, entry, queryClient, open, close}: EntryDeletionProps) {
    const deleteAction = () => entry && deleteEntry(domain, entry)
        .then(() => {
            queryClient && queryClient.invalidateQueries(`entries-${domain.id}`);
            close();
        });

    return <Dialog
        open={open}
        onClose={close}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
    >
        <DialogTitle id="alert-dialog-title">
            Delete Entry: {entry?.name}
        </DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-description">
                are you sure you wish to delete the entry?
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={close}>Cancel</Button>
            <Button onClick={deleteAction} autoFocus>
                Delete
            </Button>
        </DialogActions>
    </Dialog>
}