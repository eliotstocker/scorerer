import {QueryClient} from "react-query";
import {useForm} from "react-hook-form";
import {Domain} from "../../../database/types/domain";
import {newDomain, updateDomain} from "../admin";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    FormControlLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Modal,
    Stack,
    Switch,
    TextField,
    Typography
} from "@mui/material";
import React, {useMemo, useState} from "react";
import {Add} from "@mui/icons-material";

type NewDomainModalProps = {
    open: boolean,
    handleClose: () => void,
    queryClient: QueryClient,
    editingDomain?: Domain
}

const modalStyle = {
    position: 'fixed' as 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: 600,
    minWidth: 300
};

function useRankCount(initial = 0) : [number, () => void, () => void]{
    const [count, setCount] = useState(initial);
    useMemo(() => setCount(initial), [initial]);

    const add = () => {
        setCount(count + 1);
    };

    const remove = () => {
        if(count > 0) {
            setCount(count - 1);
        }
    }

    return [count, add, remove];
}

type DefaultValues = {
    name?: string,
    description?: string,
    identifier?: string,
    ranks?: any[],
    showResults?: boolean
};

export default function DomainModal({open, handleClose, queryClient, editingDomain}: NewDomainModalProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<Domain>({
        mode: 'onSubmit',
    });

    const onClose = () => {
        handleClose();
        reset();
    }

    useMemo(() => reset(), [editingDomain]);

    const [ranks, add, remove] = useRankCount(editingDomain ? editingDomain.ranks.length : 0);

    const onSubmit = (data: Domain) => {
        if(editingDomain) {
            return updateDomain(data)
                .then(() => queryClient.invalidateQueries('domains'))
                .then(onClose);
        }

        newDomain(data)
            .then(() => queryClient.invalidateQueries('domains'))
            .then(onClose);
    };

    errors && console.log(errors);

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
                            {editingDomain ? 'Edit Domain' : 'New Domain'}
                        </Typography>
                        <Stack paddingBottom={2}>
                            <TextField defaultValue={editingDomain && editingDomain.name} label="Name" variant="standard" {...register('name', {required: true})}/>
                            <TextField defaultValue={editingDomain && editingDomain.description} multiline label="Description" variant="standard" rows={2} {...register('description')}/>
                            <TextField defaultValue={editingDomain && editingDomain.identifier} label="CNAME" variant="standard" {...register('identifier')}/>
                            <FormControlLabel control={<Switch defaultChecked={(editingDomain && editingDomain.allowUserEntries) || true} {...register('allowUserEntries')}/>} label="Allow users to add Entries" />
                            <FormControlLabel control={<Switch defaultChecked={(editingDomain && editingDomain.disableScoring) || false} {...register('disableScoring')}/>} label="Disable score entry" />
                            <FormControlLabel control={<Switch defaultChecked={(editingDomain && editingDomain.scoreOwnEntry) || false} {...register('scoreOwnEntry')}/>} label="Allow users to score own entries" />
                            <FormControlLabel control={<Switch defaultChecked={editingDomain && editingDomain.showResults} {...register('showResults')}/>} label="Show results to users" />
                            {editingDomain && <input type="hidden" value={editingDomain.id} {...register('id', {required: true, valueAsNumber: true})}/>}
                            {editingDomain && typeof editingDomain.theme != "undefined" && <input type="hidden" value={editingDomain.theme} {...register('theme', {valueAsNumber: true})}/>}
                        </Stack>
                        <Typography color="text.secondary">Ranks</Typography>
                        <List>
                            {
                                Array.from(Array(ranks).keys()).map(index => <ListItem key={`rank-${index}`}>
                                    <TextField defaultValue={editingDomain && editingDomain.ranks[index] && editingDomain.ranks[index].name} label="Name" variant="standard" {...register(`ranks.${index}.name`, {required: true})}/>
                                    <TextField defaultValue={editingDomain && editingDomain.ranks[index] && editingDomain.ranks[index].min} label="Min" variant="standard" type="number" {...register(`ranks.${index}.min`, {required: true, valueAsNumber: true})}/>
                                    <TextField defaultValue={editingDomain && editingDomain.ranks[index] && editingDomain.ranks[index].max} label="Max" variant="standard" type="number" {...register(`ranks.${index}.max`, {required: true, valueAsNumber: true})}/>
                                </ListItem>)
                            }
                            <ListItem>
                                <ListItemButton onClick={add}>
                                    <ListItemIcon>
                                        <Add />
                                    </ListItemIcon>
                                    <ListItemText primary="Add Rank"/>
                                </ListItemButton>
                            </ListItem>
                        </List>
                        <CardActions>
                            <Button type="submit">{editingDomain ? 'Update' : 'Create'}</Button>
                            <Button onClick={handleClose}>Cancel</Button>
                        </CardActions>
                    </CardContent>
                </form>
            </Card>
        </Box>
    </Modal>
}