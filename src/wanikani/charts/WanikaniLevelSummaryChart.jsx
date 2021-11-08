import { useWanikaniApiKey } from "../stores/WanikaniApiKeyStore";
import { useState, useEffect } from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import { Box, Card, CardContent, Typography, Grid, Tooltip } from "@material-ui/core";
import { millisToDays, millisToHours } from '../../util/DateUtils';
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Stack } from '@mui/material';

const racialColor = '#00a1f1';
const kanjiColor = '#f100a1';
const vocabularyColor = '#a100f1';

const useStyles = makeStyles({
    container: {
        width: '100%',
        aspectRatio: 1 / 1
    },
    daysUntilLevelContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    subjectsLabel: {
        marginLeft: '5px',
        marginRight: '5px',
        textAlign: 'center'
    }
});

const defaultData = {
    timeOnLevel: 0,
    timeLeft: 0,
    radicals: {
        passed: 0,
        total: 0,
    },
    kanji: {
        passed: 0,
        total: 0,
    },
    vocabulary: {
        passed: 0,
        total: 0,
    },
};

function FractionText({ top, bottom }) {
    return (
        <>
            <sup>{top}</sup>&frasl;<sub>{bottom}</sub>
        </>
    );
}

function calculateHoursUntilLevelUp(radicals, kanji) {
    const radicalsLeft = radicals.filter(s => !s.data['passed_at']);
    const kanjiLeft = kanji.filter(s => !s.data['passed_at']);

    let lowestRadicalSrsStage = 999;
    for (const radical of radicalsLeft) {
        if (lowestRadicalSrsStage > radical.data['srs_stage']) {
            lowestRadicalSrsStage = radical.data['srs_stage'];
        }
    }

    switch (lowestRadicalSrsStage) {
        case 0:
        case 1:
            return 7 * 24;
        case 2:
            return (7 * 24) - 4;
        case 3:
            return (7 * 24) - 12;
        case 4:
            return (7 * 24) - 36;
    }

    let lowestKanjiSrsStage = 999;
    for (const kanji of kanjiLeft) {
        if (lowestKanjiSrsStage > kanji.data['srs_stage']) {
            lowestKanjiSrsStage = kanji.data['srs_stage'];
        }
    }

    switch (lowestKanjiSrsStage) {
        case 0:
        case 1:
            return 84.0;
        case 2:
            return 84 - 4;
        case 3:
            return 84 - 12;
        case 4:
            return 84 - 36;
    }
    return 0;
}

async function getCurrentLevelProgressData(apiKey) {
    const userData = await WanikaniApiService.getUser(apiKey)

    const currentLevel = userData.data.level;

    const levelsProgress = await WanikaniApiService.getLevelProgress(apiKey, currentLevel);
    const currentLevelProgress = levelsProgress.data[currentLevel - 1].data;

    let start;
    if (currentLevel > 1) {
        const previousLevelProgress = levelsProgress.data[currentLevel - 2].data;
        start = new Date(previousLevelProgress['passed_at']);
    } else {
        start = new Date(currentLevelProgress['started_at']);
    }

    const end = !!currentLevelProgress['passed_at'] ? new Date(currentLevelProgress['passed_at']) : new Date();
    const timeOnLevel = end.getTime() - start.getTime()

    const assignments = await WanikaniApiService.getAssignmentsForLevel(apiKey, currentLevel);

    const radicalsTotal = assignments.data.filter(s => s.data['subject_type'] === 'radical');
    const radicals = radicalsTotal.filter(s => !!s.data['passed_at']);
    const kanjiTotal = assignments.data.filter(s => s.data['subject_type'] === 'kanji');
    const kanji = kanjiTotal.filter(s => !!s.data['passed_at']);
    const vocabularyTotal = assignments.data.filter(s => s.data['subject_type'] === 'vocabulary');
    const vocabulary = vocabularyTotal.filter(s => !!s.data['passed_at']);
    const hoursLeft = calculateHoursUntilLevelUp(radicalsTotal, kanjiTotal);

    return {
        timeOnLevel: timeOnLevel,
        timeLeft: {
            days: Math.floor(hoursLeft / 24),
            hours: hoursLeft % 24,
        },
        radicals: {
            passed: radicals.length,
            total: radicalsTotal.length,
        },
        kanji: {
            passed: kanji.length,
            total: kanjiTotal.length,
        },
        vocabulary: {
            passed: vocabulary.length,
            total: vocabularyTotal.length,
        },
    };
}


function WanikaniLevelSummaryChart() {
    const classes = useStyles();
    const { apiKey } = useWanikaniApiKey();
    const [progressData, setProgressData] = useState(defaultData);

    useEffect(() => {
        getCurrentLevelProgressData(apiKey)
            .then(data => setProgressData(data))
    }, []);

    return (
        <Card className={classes.container}>
            <CardContent style={{ height: '100%' }}>

                <Stack height={'100%'}>

                    <Box sx={{ flexGrow: 1 }} className={classes.daysUntilLevelContainer} >
                        <Tooltip title={
                            <span>
                                <p>Days: {progressData.timeLeft.days}</p>
                                <p>Hours: {progressData.timeLeft.hours}</p>
                                <p>This is estimated assuming you do all reviews as soon as they are avaiable with no wrong answers.</p>
                            </span>
                        } placement={'top'}>
                            <Typography variant={'h2'} style={{ textAlign: 'center' }}>
                                {progressData.timeLeft.days > 0 ? progressData.timeLeft.days : progressData.timeLeft.hours}
                            </Typography>
                        </Tooltip>

                        <Typography variant={'caption'} style={{ textAlign: 'center' }}>
                            {progressData.timeLeft.days > 0 ? 'Days until level' : 'Hours until level'}
                        </Typography>
                    </Box>

                    <Grid item container alignItems={'center'}>
                        <Box style={{ textAlign: 'center' }}>
                            <Tooltip title={
                                <span>
                                    <p>Days: {millisToDays(progressData.timeOnLevel)}</p>
                                    <p>Hours: {millisToHours(progressData.timeOnLevel) % 24}</p>
                                </span>
                            } placement={'top'}>
                                <Typography variant={'body1'} style={{ fontWeight: 'bold' }}>
                                    {millisToDays(progressData.timeOnLevel)}
                                </Typography>
                            </Tooltip>
                            <Typography variant={'caption'}>
                                Days on level
                            </Typography>
                        </Box>

                        <Box sx={{ flexGrow: 1 }} />

                        <Box className={classes.subjectsLabel}>
                            <Typography variant={'body1'}>
                                <FractionText top={progressData.radicals.passed}
                                    bottom={progressData.radicals.total}
                                />
                            </Typography>
                            <Typography variant={'caption'} style={{ color: racialColor }}>
                                Radicals
                            </Typography>
                        </Box>

                        <Box className={classes.subjectsLabel} >
                            <Typography variant={'body1'}>
                                <FractionText top={progressData.kanji.passed}
                                    bottom={progressData.kanji.total}
                                />
                            </Typography>
                            <Typography variant={'caption'} style={{ color: kanjiColor }}>
                                Kanji
                            </Typography>
                        </Box>

                        <Box className={classes.subjectsLabel}>
                            <Typography variant={'body1'}>
                                <FractionText top={progressData.vocabulary.passed}
                                    bottom={progressData.vocabulary.total}
                                />
                            </Typography>
                            <Typography variant={'caption'} style={{ color: vocabularyColor }}>
                                Vocabulary
                            </Typography>
                        </Box>
                    </Grid>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default WanikaniLevelSummaryChart;