import makeStyles from "@material-ui/core/styles/makeStyles";
import { useWanikaniApiKey } from "./stores/WanikaniApiKeyStore";
import { Navigate } from "react-router";
import { RoutePaths } from "../Routes";
import WanikaniLevelProgessChart from "./charts/WanikaniLevelProgressChart";
import { Card } from "@material-ui/core";

const useStyles = makeStyles({
    container: {}
});

function WanikaniDashboard() {
    const classes = useStyles();
    const { apiKey } = useWanikaniApiKey();

    return (
        <div className={classes.container}>

            {!apiKey ? (<Navigate to={RoutePaths.wanikaniLogin} replace={true} />) : null}

            dashboard
        </div>
    );
}

export default WanikaniDashboard;