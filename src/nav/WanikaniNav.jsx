import React from "react";
import { RoutePaths } from '../Routes';
import NavButton from "./components/NavButton";

function WanikaniNav() {
    return (
        <div>
            <NavButton text={'Dashboard'} route={RoutePaths.wanikaniDashboard} />
            <NavButton text={'History'} route={RoutePaths.wanikaniHistory}/>
            <NavButton text={'Items'} />
        </div>
    );
}

export default WanikaniNav;