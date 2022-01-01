import {QueryClient} from "react-query";
import {useForm} from "react-hook-form";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Modal,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import React, {useMemo} from "react";
import {addEntry, updateEntry} from "../entries";
import {Entry} from "../../../database/types/entry";
import {Domain} from "../../../database/types/domain";
import useLoggedin from "../../hooks/useLoggedin";

type NewEntryModalProps = {
    open: boolean,
    handleClose: () => void,
    queryClient: QueryClient,
    domain: Domain,
    editingEntry?: Entry
}

const modalStyle = {
    position: 'fixed' as 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: 600,
    minWidth: 300
};

export default function EntryModal({open, handleClose, queryClient, domain, editingEntry}: NewEntryModalProps) {
    const { register, handleSubmit, reset, formState: { errors }} = useForm<Entry>({
        mode: 'onSubmit'
    });
    const {user} = useLoggedin();

    const onClose = () => {
        handleClose();
        reset();
    }

    useMemo(() => reset(), [editingEntry]);

    const onSubmit = (data: Entry) => {
        if(editingEntry) {
            return updateEntry(data)
                .then(() => queryClient.invalidateQueries(`entries-${domain.id}`))
                .then(onClose);
        }
        addEntry(data)
            .then(() => queryClient.invalidateQueries(`entries-${domain.id}`))
            .then(onClose);
    };

    return <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        <Box sx={modalStyle}>
            <Card raised>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent>
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                            {editingEntry ? 'Update': 'New'} Entry
                        </Typography>
                        <Stack paddingBottom={2}>
                            <TextField defaultValue={editingEntry && editingEntry.name} label="Name" variant="standard" {...register('name', {required: true})}/>
                            <TextField defaultValue={editingEntry && editingEntry.description} multiline label="Description" variant="standard" rows={2} {...register('description')}/>
                            <TextField defaultValue={editingEntry && editingEntry.index} label="Position" type="number" variant="standard" {...register('index', {valueAsNumber: true, min: 0, max: 1000})}/>
                            <TextField defaultValue={editingEntry && editingEntry.team} label="Team Name (optional)" variant="standard" {...register('team')}/>
                        </Stack>
                        {editingEntry && <input type="hidden" value={editingEntry.id} {...register('id', {required: true, valueAsNumber: true})}/>}
                        <input type="hidden" value={domain.id} {...register('domain', {required: true, valueAsNumber: true})}/>
                        <input type="hidden" value={user?.id} {...register('owner', {required: true, valueAsNumber: true})}/>
                        <CardActions>
                            <Button type="submit" >{editingEntry ? 'Update': 'Create'}</Button>
                            <Button onClick={handleClose} >Cancel</Button>
                        </CardActions>
                    </CardContent>
                </form>
            </Card>
        </Box>
    </Modal>
}