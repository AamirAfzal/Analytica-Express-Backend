const express = require('express');
const router = express.Router();
const Truck = require('../models/truck');
const DataPoint = require('../models/dataPoint');
const Route = require('../models/route');
const Sensor = require('../models/sensor');
router.post('/', async (req, res) => {
    try {
        let errors = [];
        if (!req.body.name || req.body.name === "") errors.push("Name is missing");
        if (!req.body.from || req.body.from === "") errors.push("From is missing");
        if (!req.body.to || req.body.to === "") errors.push("To is missing");
        if (!req.body.departTime || req.body.departTime === "") errors.push("Depart Time is missing");
        if (!req.body.arrivalTime || req.body.arrivalTime === "") errors.push("Arrival Time is missing");
        if (!req.body.device || req.body.device === "") errors.push("Device is missing");
        if (!req.body.temperatureThreshold || !req.body.humidityThreshold) errors.push("Threshold are missing");
        if (!req.body.route) errors.push("Route is missing");
        if (errors.length > 0) {
            res.json({
                success: false,
                message: errors.join(", "),
            });
            return;
        }

        let truck = await Truck.create({
            name: req.body.name,
            from: req.body.from,
            to: req.body.to,
            departTime: req.body.departTime,
            arrivalTime: req.body.arrivalTime,
            device: req.body.device,
            user: req.user._id,
            temperatureThreshold: req.body.temperatureThreshold,
            humidityThreshold: req.body.humidityThreshold,
            route: req.body.route,
        });

        if (truck) {
            res.json({
                success: true,
                truck,
                message: "Truck created sucessfully"
            });
        } else {
            res.json({
                success: false,
                message: "Error in creating truck"
            });
        }


    } catch (e) {
        res.json({
            success: false,
            message: e.toString()
        });
    }
});
const getCategorySensorData = async (sensors, regex) => {
    return new Promise(async (resolve, reject) => {
        let filteredSensors = sensors.filter(se => regex.test(se.id));
        filteredSensors = filteredSensors.map(async sensor => {
            return new Promise(async (resolve, reject) => {
                let rawData = await DataPoint.find({ sensor: sensor._id }).sort({ time: -1 }).exec();
                let data = [...rawData];
                let max = Math.max(...(rawData.map(dP => dP.value)));
                let min = Math.min(...(rawData.map(dP => dP.value)));
                let sum = 0;
                if (rawData.length !== 0) {
                    rawData.forEach(rD => sum += parseFloat(rD.value));
                    sum = sum / rawData.length;
                }
                data.slice(0, 30);
                resolve({
                    data,
                    sensor,
                    max,
                    min,
                    average: sum,
                });

            });
        });
        filteredSensors = await Promise.all(filteredSensors);
        resolve(filteredSensors);
    });
}
router.get('/:id', async (req, res) => {
    try {
        if (!req.params.id) {
            res.json({
                success: false,
                message: 'No id given for truck'
            });
            return;
        }

        let truck = await Truck.findOne({ _id: req.params.id });
        let routes = await Route.find({ user: req.user._id });
        routes = routes.filter(R => R.from.trim().toLowerCase() == R.from.trim().toLowerCase() && R.to.trim().toLowerCase() == R.to.trim().toLowerCase() && R.averageShockValue !== -1);
        let currentRoute = await Route.findById(truck.route);
        let leastRoute = routes.reduce((all, current) => {
            if (all.averageShockValue < current.averageShockValue) return all;
            return current;
        }, routes[0]);
        let message = "";
        if (currentRoute && leastRoute) {
            if (currentRoute._id.toString() === leastRoute._id.toString()) {
                message = "Your on the recommended route"
            } else {
                message = "Recommended Route: " + leastRoute.name;
            }
        }
        let sensors = await Sensor.find({ device: truck.device });
        let tempSensors = await getCategorySensorData(sensors, /^TEMP/g);
        let humiditySensors = await getCategorySensorData(sensors, /^HUMID/g);
        let engineTempSensors = await getCategorySensorData(sensors, /^ENGTEMP/g);
        let oilTempSensors = await getCategorySensorData(sensors, /^OILTEMP/g);
        let tirePressureSensors = await getCategorySensorData(sensors, /^TIRE/g);
        let locationSensors = await getCategorySensorData(sensors, /^GPS/g);
        let ambientTempSensors = await getCategorySensorData(sensors, /^AMBIENT/g);
        res.json({ success: true, message: "Retrieved Truck Successfully", recommendRoute: message, truck, tempSensors, humiditySensors, engineTempSensors, oilTempSensors, tirePressureSensors, locationSensors, ambientTempSensors });

    } catch (e) {
        res.json({
            success: false,
            message: e.toString(),
        })
    }
});

router.get('/route/routes', async (req, res) => {
    let routes = await Route.find({user: req.user._id});
    res.json({
        routes,
        success: true,
    });
})
router.get('/', async (req, res) => {
    try {
        let trucks = await Truck.find({});

        let finalTrucks = trucks.map(async truck => {
            return new Promise(async (resolve, reject) => {
                let sensors = await Sensor.find({ device: truck.device });
                let tempSensors = await getCategorySensorData(sensors, /^TEMP/g);
                let humiditySensors = await getCategorySensorData(sensors, /^HUMID/g);
                let engineTempSensors = await getCategorySensorData(sensors, /^ENGTEMP/g);
                let oilTempSensors = await getCategorySensorData(sensors, /^OILTEMP/g);
                let tirePressureSensors = await getCategorySensorData(sensors, /^TIRE/g);
                let locationSensors = await getCategorySensorData(sensors, /^GPS/g);
                let ambientTempSensors = await getCategorySensorData(sensors, /^AMBIENT/g);
                resolve({ truck, tempSensors, humiditySensors, engineTempSensors, oilTempSensors, tirePressureSensors, locationSensors, ambientTempSensors });
            });
        });
        finalTrucks = await Promise.all(finalTrucks);
        res.json({
            success: true,
            trucks: finalTrucks,
            message: "Got Truck Successfully"
        });
    } catch (e) {
        res.json({
            success: false,
            message: e.toString()
        });
    }
});

router.post('/route/routes', async (req, res) => {
    try {
        let errors = [];
        if (!req.body.from) errors.push("From is missing");
        if (!req.body.to) errors.push("To is missing");
        if (!req.body.name) errors.splice("name is missing");

        if (errors.length !== 0) {
            res.json({
                success: false,
                message: errors.join(", "),
            })
        }

        const route = await Route.create({
            from: req.body.from,
            to: req.body.to,
            name: req.body.name,
            averageShockValue: -1,
            user: req.user._id,
        });
        if (route) {
            res.json({
                success: true,
                routes: await Route.find({ user: req.user._id }),
            });
        } else {
            res.json({
                success: false,
                message: "Route could not be created",
            });
        }
    } catch (e) {
        res.json({
            success: false,
            message: e.toString()
        })
    }
})

module.exports = router;