const express = require('express');
const router = express.Router();
const Device = require('../models/device');
const Sensor = require("../models/sensor");
const DataPoint = require('../models/dataPoint');
const nodemailer = require('nodemailer');
const Action = require('../models/action');
const axios = require('axios');
const Farm = require('../models/farm');
const Route = require('../models/route');
const { doVegetablePrediction } = require('../MLHelper/vegetable_recommendation');
const { doCropPrediction } = require('../MLHelper/crop_recommendation');
const { doFruitPrediction } = require('../MLHelper/fruit_recommendation');
const { doRiskAnalysis } = require('../MLHelper/risk_analysis');
const { doPestPrediction } = require('../MLHelper/pest_prediction');
const truck = require('../models/truck');
const notification = require('../models/notification');
const { CRITICAL, FARM, TRUCK } = require('../MLHelper/constants');

//Method To Check for Actions and do relavant action
const getSensorValue = async (regex, sensors) => {
    return new Promise(async (resolve, reject) => {
        try {
            regex = new RegExp(regex.toLowerCase().trim());
            let matchedSensors = sensors.filter(S => regex.test(S.id.toLowerCase().trim()));
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


const doNotificationForTruck = async (truck, userId) => {
    const sensors = await Sensor.find({ device: truck.device });
    let tempValues = await getSensorValue('TEMP', sensors);
    let shockValues = await getSensorValue('shock', sensors);
    if (shockValues) shockValues = shockValues.filter(S => S);

    if (shockValues && shockValues.length !== 0) {
        Route.findById(truck.route).then(route => {
            if (!route) return null;
            if (route.averageShockValue == -1) {
                route.averageShockValue = parseFloat(shockValues[0]);
            } else {
                route.averageShockValue = route.averageShockValue + parseFloat(shockValues[0]);
                route.averageShockValue /= 2;
            }
             Route.findByIdAndUpdate(route._id.toString(),{averageShockValue: route.averageShockValue}).then(res => console.log(res)).catch(e => console.log(e.toString()))
            
        });

    }

    let humidityValues = await getSensorValue('HUMID', sensors);
    await notification.deleteMany({ target: truck._id });
    tempValues.forEach(temp => {
        if (temp > truck.temperatureThreshold)
            notification.create({
                type: CRITICAL,
                domain: TRUCK,
                message: `The temperature value in one of the packages is high (${temp}). Please check and perform proactive action`,
                user: userId,
                target: truck._id,
            });
    });
    humidityValues.forEach(humid => {
        if (humid > truck.humidityThreshold)
            notification.create({
                type: CRITICAL,
                domain: TRUCK,
                message: `The humidity value in one of the packages is high (${humid}). Please check and perform proactive action`,
                user: userId,
                target: truck._id,
            });
    });



}

const doNotificationsForTrucks = async (userId) => {
    const trucks = await truck.find({ user: userId });
    trucks.forEach(truck => doNotificationForTruck(truck, userId));
}

const performActions = async (sensors, user) => {
    const actions = await Action.find({ sensor: { $in: sensors } });
    actions.forEach(action => doAction(action));
    const sensorObjects = await Sensor.find({ _id: { $in: sensors } });
    const initDevices = await Device.find({ _id: { $in: sensorObjects.map(s => s.device) } });
    const devices = [];
    initDevices.forEach(device => {
        if (!devices.some(d => device._id === d._id)) {
            devices.push(device);
        }
    });
    const farms = await Farm.find({ device: { $in: devices.map(d => d._id) } });
    farms.forEach(async farm => {
        farm.device = devices.find(d => d._id.toString() === farm.device.toString());
        farm.sensors = await Sensor.find({ device: farm.device._id });
        let tempSensors = farm.sensors.filter(s => /^TEMP/g.test(s.id));
        let humidSensors = farm.sensors.filter(s => /^HUMID/g.test(s.id));
        let phSensors = farm.sensors.filter(s => /^PH/g.test(s.id));
        if (tempSensors.length * humidSensors.length * phSensors.length === 0) {
            return false;
        }
        let tempValue = 0;
        let dataLength = 0;
        for (let i = 0; i < tempSensors.length; i++) {
            //GET LAST 20 values
            let dataPoints = await DataPoint.find({ sensor: tempSensors[i]._id })
                .sort({ time: -1 })
                .limit(20)
                .exec();
            dataLength += dataPoints.length;

            let nextVal = tempValue !== 0;
            dataPoints.forEach(dP => {
                tempValue += parseFloat(dP.value);
            });
            if (dataPoints.length !== 0)
                tempValue = tempValue / (dataPoints.length + (nextVal ? 1 : 0));
        }
        if (dataLength === 0) return false;
        dataLength = 0;
        let humidValue = 0;
        for (let i = 0; i < humidSensors.length; i++) {
            //GET LAST 20 values
            let dataPoints = await DataPoint.find({ sensor: humidSensors[i]._id })
                .sort({ time: -1 })
                .limit(20)
                .exec();

            dataLength += dataPoints.length;

            let nextVal = humidValue !== 0;
            dataPoints.forEach(dP => {
                humidValue += parseFloat(dP.value);
            });

            humidValue = humidValue / (dataPoints.length + (nextVal ? 1 : 0));
        }
        if (dataLength === 0) return false;
        dataLength = 0;
        let phValue = 0;
        for (let i = 0; i < phSensors.length; i++) {
            //GET LAST 20 values
            let dataPoints = await DataPoint.find({ sensor: phSensors[i]._id })
                .sort({ time: -1 })
                .limit(20)
                .exec();

            dataLength += dataPoints.length;
            let nextVal = phValue !== 0;
            dataPoints.forEach(dP => {
                phValue += parseFloat(dP.value);
            });

            phValue = phValue / (dataPoints.length + (nextVal ? 1 : 0));

        }
        if (dataLength === 0) return false;

        //Since we have all the values we now make the respective predictions;
        //Do vegetable Prediction
        doVegetablePrediction(tempValue, phValue, humidValue, farm);
        doCropPrediction(tempValue, phValue, humidValue, farm);
        doFruitPrediction(tempValue, phValue, humidValue, farm);
        doRiskAnalysis(tempValue, phValue, humidValue, farm, user);
        doPestPrediction(tempValue, phValue, humidValue, farm, user);
    });
}



const doAction = async action => {
    let data = await DataPoint.find({ sensor: action.sensor }).sort({ time: -1 }).limit(1).exec();
    if (data.length === 0) return;
    data = data[0];

    let doAct = false;
    switch (action.condition) {
        case '<':
            doAct = data.value < action.value;
            break;
        case '<=':
            doAct = data.value <= action.value;
            break;
        case '==':
            doAct = data.value == action.value;
            break;
        case '>':
            doAct = data.value > action.value;
            break;
        case '>=':
            doAct = data.value >= action.value;
            break;
        default:
            doAct = false;
    }

    if (doAct) {
        if (action.action === 'email') {
            var transport = nodemailer.createTransport({
                host: "smtp.mailtrap.io",
                port: 2525,
                auth: {
                    user: "95c7c840240378",
                    pass: "7bbd03d79fe59f"
                }
            });
            let mail = await transport.sendMail({
                from: 'Analytica.IoT <admin@analytica.iot>',
                to: 'The User <user@user.com>',
                text: `
                    An Action has just been invoked! The sensor ${action.sensor} has a value of ${data.value} 
                `
                ,
                html: `<h4>
                An Action has just been invoked! The sensor ${action.sensor} has a value of ${data.value} </h4>
            `,
                subject: 'An Action has been invoked!'

            });
            console.log(mail);
        } else if (action.action === "sms") {
            // Paid Api Use economically :)
            let ENDPOINT = `https://sendpk.com/api/sms.php?username=923318337060&password=malik200&sender=Analytica&mobile=${action.to}&message=${encodeURI(`An Action has been invoked The sensor ${action.sensor} has a value of ${data.value}`)}`;
            let result = await axios.post(ENDPOINT, {});
            console.log(result);
        }
    }

}


/* Get Functions For Devices */


router.get('/notification', async (req, res) => {
    const notifications = await notification.find({ user: req.user._id });
    res.json({ success: true, notifications });
})
/* Function returns list of devices for that user*/
router.get('/', async (req, res) => {
    try {
        let devices = await Device.find({ user: req.user._id });
        res.json({
            success: true,
            devices: devices,
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.toString(),
        })
    }
});


/* Function return the list of sensors for given device */
router.get('/:deviceid', async (req, res) => {
    try {
        let deviceId = req.params.deviceid;

        //Get Device information
        let device = await Device.findOne({ user: req.user._id, id: deviceId });
        if (!device) res.json({ success: false, message: `Device not found with ID ${deviceId}` });

        let sensors = await Sensor.find({ device: device._id });
        let data = sensors.map(sensor => DataPoint.find({ sensor: sensor._id }).sort({ time: -1 }).limit(1));
        data = await Promise.all(data);

        let payload = [...sensors];
        payload.forEach((load, i) => {
            if (data[i].length !== 0) payload[i] = { ...load.toJSON(), lastUpdate: data[i][0] }
        })
        res.json({
            success: true,
            device: device,
            sensors: payload,
            message: "Operation completed successfully!"
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.toString(),
        })
    }
});
router.get('/id/:deviceid', async (req, res) => {
    try {
        let deviceId = req.params.deviceid;

        //Get Device information
        let device = await Device.findOne({ user: req.user._id, _id: deviceId });
        if (!device) res.json({ success: false, message: `Device not found with ID ${deviceId}` });

        let sensors = await Sensor.find({ device: device._id });
        let data = sensors.map(sensor => DataPoint.find({ sensor: sensor._id }).sort({ time: -1 }).limit(1));
        data = await Promise.all(data);

        let payload = [...sensors];
        payload.forEach((load, i) => {
            if (data[i].length !== 0) payload[i] = { ...load.toJSON(), lastUpdate: data[i][0] }
        })
        res.json({
            success: true,
            device: device,
            sensors: payload,
            message: "Operation completed successfully!"
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.toString(),
        })
    }
});


/* Get Data of Sensor With limit */
router.get('/:deviceid/sensor/:sensorid/limit/:limit', async (req, res) => {
    try {
        let limit;
        try {
            limit = parseInt(req.params.limit);
        } catch (error) {
            res.json({
                success: false,
                message: `Limit must be an integer found ${req.params.limit}`
            });
        }
        let deviceId = req.params.deviceid;

        //Get Device information
        let device = await Device.findOne({ user: req.user._id, _id: deviceId });
        if (!device) res.json({ success: false, message: `Device not found with ID ${deviceID}` });

        //Get Sensor Info
        let sensor = await Sensor.findOne({ device: device._id, _id: req.params.sensorid });
        if (!sensor) res.json({ success: false, message: `Sensor not found with ID ${req.params.sensorid}` });

        let data = await DataPoint.find({ sensor: sensor._id }).sort({ time: -1 }).limit(limit);

        res.json({
            success: true,
            device: device,
            sensor: sensor,
            data: data
        });



    } catch (error) {
        res.json({
            success: false,
            message: error.toString()
        })
    }
});


// Get Data With Time Limit
router.get('/:deviceid/sensor/:sensorid/days/:days', async (req, res) => {
    try {
        let days;
        try {
            days = parseInt(req.params.days);
            if (!Number.isInteger(days)) throw "Day not a number";
        } catch (error) {
            res.json({
                success: false,
                message: `Days must be an integer found ${days} ${error.toString()}`
            });
        }
        let deviceId = req.params.deviceid;

        //Get Device information
        let device = await Device.findOne({ user: req.user._id, _id: deviceId });
        if (!device) res.json({ success: false, message: `Device not found with ID ${deviceID}` });

        //Get Sensor Info
        let sensor = await Sensor.findOne({ device: device._id, _id: req.params.sensorid });
        if (!sensor) res.json({ success: false, message: `Sensor not found with ID ${req.params.sensorid}` });

        let cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        let data = await DataPoint.find({ sensor: sensor._id, time: { $gt: cutoffDate } }).sort({ time: -1 })

        res.json({
            success: true,
            device: device,
            sensor: sensor,
            data: data
        });



    } catch (error) {
        res.json({
            success: false,
            message: error.toString()
        })
    }
});

/* Post Functions */


/* Function requires unique deviceId. Throws Error if device Id and name is not present
* Also can throw error if device id is not unique. Optionally device type can be supplied
* Returns information about device if operation successfull else returns error with success false
*/
router.post('/initialize', async (req, res) => {
    try {
        //First of all check that all parameters are present
        let errors = [];
        if (!req.body.id) {
            errors.push("A Device ID is required");
        }
        if (!req.body.name) {
            errors.push("A Device Name is required");
        }
        if (errors.length !== 0) {
            res.json({
                success: false,
                message: errors.join("\n")
            });
            return;
        }


        //Check Device ID is unique for this user
        let devices = await Device.find({ user: req.user._id, id: req.body.id });

        if (devices.length !== 0) {
            res.json({
                success: false,
                message: 'Please use a unique Id. A device already exists with the id ' + devices[0].id
            });
            return;
        }

        //Create Device since all tests have passed
        let createdDevice = await Device.create({
            id: req.body.id,
            name: req.body.name,
            user: req.user._id,
            type: req.body.type || "Default Device"
        });
        //If Device has been created successfully
        if (createdDevice) {
            res.json({
                success: true,
                message: "Device created successfully!",
                device: createdDevice
            })
        } else { // Some error occured (Database or schema error)
            res.json({
                success: false,
                message: "An unknown error occurred"
            })
        }

    } catch (err) {
        res.json({
            success: false,
            message: err.toString()
        })
    }
});


/* 
* This endpoint create sensor for the given device
* Required Paramaters are
* id: the id for the sensor
* name: the name for the sensor
* device: the device id to which the sensor will belong
* the function will return the sensor otherwise a error with success false and message in message field
*/
router.post('/sensor/create', async (req, res) => {

    try {
        //Handle validation errors
        let errors = [];
        if (!req.body.id) errors.push("A sensor id is required");
        if (!req.body.name) errors.push("A sensor name is required");
        if (!req.body.device) errors.push("A device id is required");
        if (errors.length !== 0) {
            res.json({
                success: false,
                message: errors.join("\n"),
            });
            return;
        }
        //Check if device exists
        let device = await Device.findOne({ id: req.body.device });
        if (!device) {
            res.json({
                success: false,
                message: `The device ${req.body.device} does not exist`,
            });
            return;
        };

        //Check if sensor id is unique
        let sensors = await Sensor.find({ id: req.body.id });
        if (sensors.length !== 0) {
            res.json({
                success: false,
                message: `The sensor ${sensors[0].id} already exists`
            });
            return;
        }

        //Create sensor
        let createdSensor = await Sensor.create({
            id: req.body.id,
            name: req.body.name,
            device: device._id,
            type: req.body.type || "Default Sensor",
        });
        if (createdSensor) {
            res.json({
                success: true,
                message: 'Sensor created successfully',
                sensor: createdSensor,
            })
        } else {
            res.json({
                success: false,
                message: "An unknown error occured"
            })
        };
    } catch (error) {
        res.json({
            success: false,
            message: error.toString(),
        });
    }

});


/*
* Add Data Point
* A Batch endpoint that can add data from list 
*/
router.post('/updatedata', async (req, res) => {
    //Validate Data
    try {
        let errors = [];
        req.body.data.forEach((dataPoint, i) => {
            if (!dataPoint.sensor) errors.push(`Sensor ID required for Data at Index ${i}`);
            if (!dataPoint.value && dataPoint.value !== 0) errors.push(`Sensor data missing for Data at Index ${i}`);
        });

        //Check if sensor exists
        let promises = req.body.data.map(dataPoint => Sensor.findOne({ id: dataPoint.sensor }));
        let SolvedPromises = await Promise.all(promises);

        SolvedPromises.forEach((sensor, i) => {
            if (sensor === null) errors.push(`Sensor ${req.body.data[i].sensor} does not exist`);
        });

        if (errors.length !== 0) {
            res.json({
                success: false,
                message: errors.join('\n'),
            })
        }
        promises = [];

        //Place Create data and start inserting in DB
        req.body.data.forEach((dataPoint, i) => {

            promises.push(DataPoint.create({
                value: dataPoint.value,
                sensor: SolvedPromises[i]._id,
                time: dataPoint.time || Date.now(),
            }));
        });
        SolvedPromises = await Promise.all(promises);
        if (SolvedPromises.filter(dP => dP === null).length === 0) {
            let sensors = new Set(SolvedPromises.map(dP => dP.sensor.toString()));
            performActions([...sensors], req.user);
            doNotificationsForTrucks(req.user._id);
            res.json({
                success: true,
                message: "All data inserted successfully",
                data: SolvedPromises,
            })
        } else {
            res.json({
                success: false,
                message: "Failed to insert some or all of the data. Inserted data is returned in the response",
                data: SolvedPromises,
            })
        }
    } catch (error) {
        res.json({
            success: false,
            message: error.toString(),
        })
    }



});


module.exports = router;