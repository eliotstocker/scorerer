import React, {useEffect, useState} from "react";
import {QueryClient, QueryClientProvider} from "react-query";
import useLoggedin from "../hooks/useLoggedin";
import Login from "../component/Login";
import {Add} from '@mui/icons-material';
import AllDomains from "./components/AllDomains";
import DomainModal from "./components/DomainModal";
import {AppBar, Avatar, Container, Fab, IconButton, Menu, MenuItem, Toolbar, Typography} from "@mui/material";
import {Domain} from "../../database/types/domain";
import {deepOrange} from "@mui/material/colors";

const queryClient = new QueryClient();

export default function () {
    return (
        <QueryClientProvider client={queryClient}>
            <LoginWall />
        </QueryClientProvider>
    );
}

function LoginWall() {
    const {isLoading, isLoggedIn, user} = useLoggedin();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingDomain, setEditingDomain] = useState<Domain | undefined>();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    useEffect(() => {
        document.title = isLoggedIn ? "Score App Admin" : "Score App Login";
    }, [isLoggedIn]);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    if(isLoading) {
        return <h1>loading...</h1>;
    }

    if(!isLoggedIn) {
        return <Login queryClient={queryClient}/>;
    }

    return <>
        <AppBar>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>Scoring App Admin</Typography>
                <div>
                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        color="inherit"
                    >
                        <Avatar sx={{ bgcolor: deepOrange[500] }}>{user?.name.split(' ').map(word => word.charAt(0)).join('')}</Avatar>
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
                    </Menu>
                </div>
                </Toolbar>
        </AppBar>
        <Container style={{paddingTop: '50px'}}>
            <AllDomains editDomain={(domain) => {
                setEditingDomain(domain);
                setModalOpen(true);
            }} queryClient={queryClient}/>
        </Container>
        <DomainModal open={modalOpen} handleClose={() => {
            setModalOpen(false);
            setEditingDomain(undefined);
        }} queryClient={queryClient} editingDomain={editingDomain}/>
        <Fab color="primary" aria-label="add" onClick={() => setModalOpen(true)} style={{position: "fixed", bottom: '16px', right: '16px'}}>
            <Add />
        </Fab>
    </>;
}