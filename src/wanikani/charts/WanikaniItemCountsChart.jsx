import { useWanikaniApiKey } from "../stores/WanikaniApiKeyStore";
import { useState, useEffect } from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import { Badge, Card, CardContent, Link, Tooltip, Typography } from "@material-ui/core";
import { wanikaniColors } from "../../Constants";
import makeStyles from "@material-ui/core/styles/makeStyles";

function assignmentsToCounts(assignments) {
    return {
        total: assignments.length,
        radicals: assignments.filter(assignment => assignment.data['subject_type'] === 'radical').length,
        kanji: assignments.filter(assignment => assignment.data['subject_type'] === 'kanji').length,
        vocabulary: assignments.filter(assignment => assignment.data['subject_type'] === 'vocabulary').length,
    }

}

function CountTile({ label, data, color }) {
    return (
        <Tooltip title={
            <div>
                <p>Radicals: {data?.radicals}</p>
                <p>Kanji: {data?.kanji}</p>
                <p>Vocabulary: {data?.vocabulary}</p>
            </div>
        } placement={'top'}>
            <div style={{
                textAlign: 'center',
                width: 'fit-content',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <div style={{
                    background: color,
                    padding: '5px',
                    width: '60px',
                    borderRadius: '5px',
                    boxShadow: 'rgba(0, 0, 0, 0.3) 5px 4px 10px',
                }}>
                    {data?.total}
                </div>

                <div style={{ marginTop: '5px' }}>
                    <Typography variant={'caption'} color={'textPrimary'}>
                        {label}
                    </Typography>
                </div>
            </div>
        </Tooltip>
    );
}

async function fetchData(apiKey) {
    const assignments = (await WanikaniApiService.getAllAssignments(apiKey));

    const available = assignments.filter(assignment => assignment.data['srs_stage'] == 0);
    const apprentice = assignments.filter(assignment => assignment.data['srs_stage'] > 0 && assignment.data['srs_stage'] < 5);
    const guru = assignments.filter(assignment => assignment.data['srs_stage'] >= 5 && assignment.data['srs_stage'] < 7);
    const master = assignments.filter(assignment => assignment.data['srs_stage'] >= 7 && assignment.data['srs_stage'] < 8);
    const enlightened = assignments.filter(assignment => assignment.data['srs_stage'] >= 8 && assignment.data['srs_stage'] < 9);
    const burned = assignments.filter(assignment => assignment.data['srs_stage'] >= 9);


    return {
        available: assignmentsToCounts(available),
        apprentice: assignmentsToCounts(apprentice),
        guru: assignmentsToCounts(guru),
        master: assignmentsToCounts(master),
        enlightened: assignmentsToCounts(enlightened),
        burned: assignmentsToCounts(burned),
    };
}

function WanikaniItemCountsChart() {
    const { apiKey } = useWanikaniApiKey();
    const [data, setData] = useState();

    useEffect(() => {
        fetchData(apiKey)
            .then(setData)
            .catch(console.error);
    }, []);

    console.log(data);

    return (
        <Card>
            <CardContent>

                <div style={{ display: 'flex', gap: '5px', justifyContent: 'space-around' }}>
                    <CountTile
                        label={'Available'}
                        data={data?.available}
                        color={'#686868'}
                    />

                    <CountTile
                        label={'Apprentice'}
                        data={data?.apprentice}
                        color={wanikaniColors.pink}
                    />

                    <CountTile
                        label={'Guru'}
                        data={data?.guru}
                        color={wanikaniColors.purple}
                    />
                </div>

                <div style={{ display: 'flex', gap: '5px', justifyContent: 'space-around', marginTop: '10px' }}>
                    <CountTile
                        label={'Master'}
                        data={data?.master}
                        color={'#3556dd'}
                    />

                    <CountTile
                        label={'Enlightened'}
                        data={data?.enlightened}
                        color={'#0098e5'}
                    />

                    <CountTile
                        label={'Burned'}
                        data={data?.burned}
                        color={'#474647'}
                    />
                </div>


            </CardContent>
        </Card>
    );
}

export default WanikaniItemCountsChart;