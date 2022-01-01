import {QueryClient, useQuery} from "react-query";
import {getDomains} from "../admin";
import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Modal,
    Typography
} from "@mui/material";
import React, {useState} from "react";
import {Domain} from "../../../database/types/domain";
import {MenuBook} from "@mui/icons-material";
import EntryList from "../../component/EntryList";

type AllDomainsProps = {
    editDomain: (domain: Domain) => void,
    queryClient: QueryClient
}

const modalStyle = {
    position: 'fixed' as 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: 600,
    minWidth: 300
};

export default function AllDomains({editDomain, queryClient}: AllDomainsProps) {
    const {isLoading, data: domains, error} = useQuery('domains', getDomains);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState<Domain | undefined>();

    if (isLoading) {
        return <CircularProgress />
    }

    if (error) {
        return <h1>Error</h1>
    }

    return <>
        <List>
            {
                domains && domains.map(domain =>
                    <ListItem key={`domain-${domain.id}`} secondaryAction={<IconButton edge="end" aria-label="Entries" onClick={() => {
                        setSelectedDomain(domain);
                        setModalOpen(true);
                    }}><MenuBook/></IconButton>}>
                        <ListItemButton onClick={editDomain.bind(null, domain)}>
                            <ListItemText primary={domain.name} secondary={domain.description}/>
                        </ListItemButton>
                    </ListItem>
                )
            }
        </List>
        <Modal open={modalOpen} onClose={setModalOpen.bind(null, false)}>
            <Box sx={modalStyle}>
                <Card raised>
                    <CardContent>
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                            Entries
                        </Typography>
                        {selectedDomain && <EntryList domain={selectedDomain} jump={() => {}} realUsers allowDeletion queryClient={queryClient}/>}
                    </CardContent>
                </Card>
            </Box>
        </Modal>
    </>;
}