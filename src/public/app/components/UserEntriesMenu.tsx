import {Avatar, Divider, IconButton, Menu, MenuItem, useTheme} from "@mui/material";
import React, {useState} from "react";
import EntryModal from "./EntryModal";
import useLoggedin from "../../hooks/useLoggedin";
import {QueryClient, useQuery} from "react-query";
import {Domain} from "../../../database/types/domain";
import {deepOrange} from "@mui/material/colors";
import {getDomainEntries} from "../../common";
import {Entry} from "../../../database/types/entry";

type UserEntriesProps = {
    queryClient: QueryClient,
    domain: Domain
};

export default function UserEntriesMenu({queryClient, domain}: UserEntriesProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<Entry | undefined>();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const {data} = useQuery('entries', (domain && typeof domain.id != "undefined") ? getDomainEntries.bind(null, domain.id) : () => []);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const theme = useTheme();
    const {user} = useLoggedin();

    return <div>
        <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
        >
            <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>{user?.name.split(' ').map(word => word.charAt(0)).join('')}</Avatar>
        </IconButton>
        <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
        >
            <MenuItem>{user?.name}</MenuItem>
            <Divider/>
            {domain.allowUserEntries && <MenuItem onClick={() => {
                setModalOpen(true);
                setEditingEntry(undefined);
                handleClose();
            }}>New Entry</MenuItem>}
            <Divider/>
            {data && data.filter(({owner}) => owner === user?.id).map(entry => <MenuItem key={`entry-${entry.id}`} onClick={() => {
                setModalOpen(true);
                setEditingEntry(entry);
                handleClose();
            }}>{entry.name}</MenuItem>)}
        </Menu>
        <EntryModal open={modalOpen} handleClose={setModalOpen.bind(null, false)} queryClient={queryClient} domain={domain} editingEntry={editingEntry}/>
    </div>;
}