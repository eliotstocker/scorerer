import React, {CSSProperties, ReactElement} from "react";
import {createTheme, Paper, ThemeOptions, ThemeProvider} from "@mui/material";
import {useGoogleFonts} from "@flayyer/use-googlefonts";
import {useQuery} from "react-query";
import {getTheme} from "../entries";

type ThemedWrapperProps = {
    domainId: number,
    children: ReactElement | ReactElement[]
};

export default function ThemedWrapper({domainId, children}: ThemedWrapperProps) {
    const {data: themeDef} = useQuery('theme', getTheme.bind(null, domainId));
    useGoogleFonts([
        {
            family: themeDef?.font || 'Roboto',
            styles: [
                "regular",
                "italic"
            ],
        }
    ]);

    const themeProps: ThemeOptions = {
        palette: {
            mode: themeDef?.dark ? "dark" : "light",
        },
        typography: {
            h2: {
                fontSize: '1.25rem'
            }
        }
    };

    if(themeDef?.mainColor) {
        // @ts-ignore
        themeProps.palette.primary = {main: themeDef?.mainColor}
    }

    if(themeDef?.accentColor) {
        // @ts-ignore
        themeProps.palette.secondary = {main: themeDef?.accentColor}
    }

    if(themeDef?.titleSize) {
        // @ts-ignore
        themeProps.typography.h2.fontSize = themeDef.titleSize;
    }

    if (themeDef?.font) {
        // @ts-ignore
        themeProps.typography.fontFamily = "'EB Garamond', serif"
    }

    const theme = createTheme(themeProps);

    const paperStyles : CSSProperties = {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
    };

    if(themeDef?.backgroundImage) {
        paperStyles.backgroundImage = `url('${themeDef.backgroundImage}')`;
        paperStyles.backgroundSize = 'cover';
        if(themeDef?.backgroundPosition) {
            paperStyles.backgroundPosition = themeDef.backgroundPosition;
        }
    }

    return <ThemeProvider theme={theme}>
        <Paper elevation={0} style={paperStyles}>
            {children}
        </Paper>
    </ThemeProvider>;
}