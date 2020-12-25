const express = require('express');
const router = express.Router();
const Smart = require('../models/smart');
const DataPoint = require("../models/dataPoint");
const Sensor = require('../models/sensor');
const user = require('../models/user');
const regression = require('regression');




const UNKNOWN_ERROR = {
    success: false,
    message: "An unknown error occured",
};

const calculateValue = (coefficients, x) => {
    return coefficients.reduce((current, value, index) => {
        return current + value * Math.pow(x, coefficients.length - 1 - index);
    }, 0)
}

const predictElectricValues = async sensors => {
    return new Promise(async (resolve, reject) => {
        try {
            let electricSensors = sensors.filter(S => /ELECTRIC_/.test(S.id));
            if (electricSensors.length !== 0) {
                let average = await Promise.all(electricSensors.map(ES => new Promise(async (resolve, reject) => {
                    let dataPoints = await DataPoint.find({ sensor: ES._id }).limit(10).sort({ time: -1 });
                    try {
                        resolve(predictValues(dataPoints));
                    } catch (e) {
                        reject(e);
                    }
                })));
                resolve(average);
            }
            resolve(undefined);
        } catch (e) {
            reject(e);
        }
    })
}

const predictValues = dataPoints => {
    const mappedPoints = dataPoints.map(DP => [parseInt(DP.time.getTime().toString().slice(0, 5)), parseInt(DP.value),]);
    const result = regression.linear(mappedPoints);
    let D = new Date();
    D.setDate(D.getDate() + 1);
    const predicted = {};
    for (let i = 0; i < 30; i++) {
        predicted[`${D.getFullYear()}-${D.getMonth() + 1}-${D.getDate()}`] = result.predict(parseInt(D.getTime().toString().slice(0, 5)))[1];
        D.setDate(D.getDate() + 1);
    }
    return predicted;
}

const getSmartSummary = async (smart) => {
    return new Promise(async (resolve, reject) => {
        try {
            let toR = { smart };
            if (!smart) throw "Argument is undefined";
            let sensors = await Sensor.find({ device: smart.device });
            toR.temperatureValues = await getSensorValue('TEMP_', sensors);
            toR.humidityValues = await getSensorValue('HUMID_', sensors);
            toR.electricityValues = await getSensorValue('ELECTRIC_', sensors);
            toR.temperatureValues = toR.temperatureValues.filter(R => R != null);
            resolve(toR);
        } catch (e) {
            reject(e.toString());
        }
    });
};

const getSensorAverage = async (regex, sensors) => {
    return new Promise(async (resolve, reject) => {
        try {
            regex = new RegExp(regex);
            let matchedSensors = sensors.filter(S => regex.test(S.id));
            if (matchedSensors.length !== 0) {
                let averages = await Promise.all(matchedSensors.map(async MS => new Promise(async (resolve, reject) => {
                    let dPs = await DataPoint.find({ sensor: MS._id });
                    let avg = dPs.reduce((current, DP) => (current + parseFloat(DP.value) / dPs.length), 0);
                    resolve(avg);
                })));
                resolve(averages);
            }
            resolve(undefined);
        } catch (e) {
            reject(e);
        }
    })
}

const getSummaryDetail = async smart => {
    return new Promise(async (resolve, reject) => {
        try {
            smart = await getSmartSummary(smart);
            let toR = { ...smart };
            if (!smart) throw "Argument is undefined";

            let sensors = await Sensor.find({ device: smart.smart.device });

            toR.temperatureChart = await getSensorHistory('TEMP_', sensors);
            toR.humidityChart = await getSensorHistory('HUMID_', sensors);
            toR.electricityChart = await getSensorHistory('ELECTRIC_', sensors);
            toR.electricityAvg = await getSensorAverage('ELECTRIC_', sensors);
            toR.electricityPredictions = await predictElectricValues(sensors);

            toR.recommendation = [];

            if (toR.temperatureValues && toR.temperatureValues.length !== 0) {
                if (parseInt(toR.temperatureValues[0]) > 18) {
                    toR.recommendation.push(`Please decrease the temperature as ${toR.temperatureValues[0]} is high`)
                }
                else if (parseInt(toR.temperatureValues[0]) < 14) {
                    toR.recommendation.push(`Please increase the temperature as ${toR.temperatureValues[0]} is low`)
                }
            }

            resolve(toR);
        } catch (e) {
            reject(e.toString());
        }
    });
}

const getSensorHistory = async (regex, sensors) => {
    return new Promise(async (resolve, reject) => {
        regex = new RegExp(regex);
        try {
            let matchedSensors = sensors.filter(S => regex.test(S.id));
            if (matchedSensors.length !== 0) {
                let charts = await Promise.all(matchedSensors.map(MS => new Promise(async (resolve, reject) => {
                    try {
                        const dPs = await DataPoint.find({ sensor: MS._id });
                        if (dPs.length > 0) {
                            let chart = dPs.reduce((current, DP) => {
                                let time = `${DP.time.getFullYear()}-${DP.time.getMonth() + 1}-${DP.time.getDate()}`;
                                current[time] = DP.value;
                                return current;
                            }, {});
                            resolve(chart);
                        } else {
                            resolve(undefined);
                        }
                    } catch (e) {
                        reject(e.toString());
                    }
                })));
                if (charts) {
                    resolve(charts);
                } else {
                    resolve(undefined);
                }
            } else {
                resolve(undefined);
            }
        } catch (e) {
            reject(e.toString());
        }
    });
}

const getSensorValue = async (regex, sensors) => {
    return new Promise(async (resolve, reject) => {
        try {
            regex = new RegExp(regex);
            let matchedSensors = sensors.filter(S => regex.test(S.id));
            if (matchedSensors.length !== 0) {
                let dataPoints = await Promise.all(matchedSensors.map(async MS => new Promise(async (resolve, reject) => {
                    try {
                        const dPs = await DataPoint.find({ sensor: MS._id }).limit(1).sort({ time: -1 });
                        if (dPs.length > 0) {
                            resolve(dPs[0].value);
                        } else {
                            resolve(undefined);
                        }
                    } catch (e) {
                        reject(e.toString());
                    }
                })));
                //console.log(dataPoints);
                resolve(dataPoints);

            } else {
                resolve(undefined);
            }
        } catch (e) {
            reject(e.toString());
        }
    });
}


router.get('/', async (req, res) => {
    try {
        let smarts = await Smart.find({ user: req.user._id });
        smarts = await Promise.all(smarts.map(S => getSmartSummary(S)));

        if (smarts) {
            res.json({
                success: true,
                smarts
            });
            return;
        } else {
            res.json(UNKNOWN_ERROR);
            requestAnimationFrame;
        }
    } catch (e) {
        res.json({
            success: false,
            message: e
        })
    }

});

router.get('/:id', async (req, res) => {
    try {
        if (!req.params.id) {
            res.json({
                success: false,
                message: "ID not found",
            });
            return;
        }

        let smart = await Smart.findById(req.params.id);
        if (!smart) throw "cannot find smart from id";

        smart = await getSummaryDetail(smart);

        if (smart) {
            res.json({
                success: true,
                smart
            });
            return;
        } else {
            res.json(UNKNOWN_ERROR);
        }

    } catch (e) {
        res.json({
            success: false,
            message: e,
        })
    }
});

router.post('/', async (req, res) => {
    try {
        let errors = [];

        if (!req.body.name) errors.push("Name is not present");
        if (!req.body.location || (!req.body.location.lat && req.body.location.lat !== 0) || (!req.body.location.long && req.body.location.long !== 0)) errors.push("Location not present");
        if (!req.body.device) errors.push("Device not present");
        if (errors.length !== 0) {
            res.json({
                success: false,
                message: errors.join(", "),
            });
            return;
        };

        const smart = await Smart.create({
            name: req.body.name,
            location: req.body.location,
            device: req.body.device,
            user: req.user._id,
        });

        if (smart) {
            res.json({
                success: true,
                smart,
            });
            return;
        } else {
            res.json(UNKNOWN_ERROR);
            return;
        }

    } catch (e) {
        res.json({
            success: false,
            message: e.toString(),
        })
    }
});

module.exports = router;