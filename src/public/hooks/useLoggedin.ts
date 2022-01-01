import {useQuery} from 'react-query'
import {getCurrentUser} from "../common";
import {User} from "../../database/types/user";

type LoggedInHook = {
    isLoading: boolean;
    isLoggedIn: boolean;
    user?: User;
}

export default function() : LoggedInHook {
    const {isLoading, error, data} = useQuery('user', getCurrentUser, {retry: 1});

    if(isLoading) {
        return {
            isLoading: true,
            isLoggedIn: false
        };
    }

    if (error) {
        return {
            isLoading: false,
            isLoggedIn: false
        };
    }

    return {
        isLoading: false,
        isLoggedIn: true,
        user: data
    };
}