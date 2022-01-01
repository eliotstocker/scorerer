import React from 'react';
import {Alert, Button, Card, CardActions, CardContent, Container, Divider, TextField, Typography} from "@mui/material";
import { useForm } from 'react-hook-form';
import {User} from "../../database/types/user";
import {login} from "../common";
import {QueryClient} from "react-query";
import {ArrowCircleRightOutlined} from "@mui/icons-material";

type LoginProps = {
    queryClient: QueryClient;
}

export default function({queryClient}: LoginProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<User>({
        mode: 'onSubmit'
    });

    const onSubmit = (data: User) => {
        login(data)
            .then(() => queryClient.invalidateQueries('user'));
    };

    return <Container style={{height: '100vh'}}>
        <form onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="h3" component="div" color="secondary.main" gutterBottom pt={20}>
                Tell Us<br/>
                a Little About<br/>
                Yourself.
            </Typography>
            <TextField id="name" label="Please Enter Name" variant="standard" {...register("name",{required: true})}/>
            {errors.name && <Typography variant="subtitle1">
                <Alert severity="error">This field is required</Alert>
            </Typography>}
            <Button size="small" type="submit" style={{verticalAlign: 'bottom'}}><ArrowCircleRightOutlined/></Button>
        </form>
    </Container>;
}