var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passwordHash = require("password-hash");
var jwt = require("jsonwebtoken");
var passport = require("passport");
var mongoose = require('mongoose');
var Report = require('../models/report');
var DataPoint = require('../models/dataPoint');
var Sensor = require('../models/sensor');
var Device = require('../models/device');
const Notification = require('../models/notification');
const nodemailer = require('nodemailer');

const HISTORY = 0, CURRENT = 1;
const WEEKLY = 0, MONTHLY = 1, QUARTERLY = 2, YEARLY = 3;
const strings = {
  [WEEKLY] : "Weekly",
  [MONTHLY]: "Monthly",
  [QUARTERLY]: "Quarterly",
  [YEARLY]: "Yearly",
}


const generateTable = async sensorId => {
  return new Promise(async (resolve, reject) => {
    try {
      const sensor = (await Sensor.find({ id: sensorId }))[0];
      if (sensor) {
        const dataPoints = await DataPoint.find({ sensor: sensor._id }).limit(30).sort({ time: -1 }).exec();
        if (!dataPoints) reject("Datapoint is not found");
        let htmlString = `<br/><h1>Sensor: ${sensor.id}</h1><br/>`;
        htmlString += `<table>`;
        htmlString += `<tr><th>Date</th><th>Value</th></tr>`;
        htmlString += dataPoints.reduce((current, value) => {
          return (current + `<tr><td>${value.time}</td><td>${value.value}</td></tr>`)
        }, "");
        htmlString += `</table>`;
        resolve(htmlString);
      } else {
        reject("Sensor not found");
      }
    } catch (e) {
      reject(e);
    }
  });
};

const generateValue = async sensorId => {
  return new Promise(async (resolve, reject) => {
    try {
      const sensor = (await Sensor.find({ id: sensorId }))[0];
      if (sensor) {
        const dataPoints = await DataPoint.find({ sensor: sensor._id }).limit(1).sort({ time: -1 });
        if (!dataPoints) reject("Datapoint is not found");
        let htmlString = `<br/><h1>Sensor: ${sensor.id}</h1><br/>`;
        htmlString += `<table>`;
        htmlString += `<tr><th>Date</th><th>Value</th></tr>`;
        htmlString += dataPoints.reduce((current, value) => (current + `<tr><td>${value.time}</td><td>${value.value}</td></tr>`), "");
        htmlString += `</table>`;
        resolve(htmlString);
      } else {
        reject("Sensor not found");
      }
    } catch (e) {
      reject(e);
    }
  });
}

const processReport = async (report) => {
  return new Promise(async (resolve, reject) => {
    try {
      let nowDate = new Date();
      let diffDate = Math.abs(nowDate - report.lastReportedAt);
      const diffDays = Math.ceil(diffDate / (1000 * 60 * 60 * 24));

      let toReport = false;

      switch (report.type) {
        case WEEKLY:
          toReport = diffDays >= 7;
          break;
        case MONTHLY:
          toReport = diffDays >= 30;
          break;
        case QUARTERLY:
          toReport = diffDays >= 90;
          break;
        case YEARLY:
          toReport = diffDays >= 365;
          break;
      }

      if (true || toReport) {
        const user = await User.findById(report.user);
        if (!user) reject("No user found for report");

        let html = report.reportItems.map(reportItem => {
          if (reportItem.type === CURRENT) {
            return generateValue(reportItem.sensor);
          } else {
            return generateTable(reportItem.sensor);  
          }
        });

        html = await Promise.all(html);
        var transport = nodemailer.createTransport({
          host: "smtp.mailtrap.io",
          port: 2525,
          auth: {
            user: "95c7c840240378",
            pass: "7bbd03d79fe59f"
          }
        });
        let htmlString = html.join("<br/>");
        let mail = await transport.sendMail({
          from: 'Analytica.IoT <admin@analytica.iot>',
          to: `The User <${user.email}>`,
          text: htmlString,
          html: htmlString,
          subject: `Your ${strings[report.type]} report`

        });
        let updatedReport = await Report.findByIdAndUpdate(report._id, { lastReportedAt: new Date() });
        console.log(mail);
        resolve(mail);
      }
      else {
        resolve("Nothing to report");
      }

    }
    catch (e) {
      reject(e.toString());
    }
  }
  );
};

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/genReport', async (req, res) => {
  try {
    let reports = await Report.find();
    reports = await Promise.all(reports.map(R => processReport(R)));
    res.json({
      success: true,
      reports,
    });
  } catch (e) {
    res.json({ e })
  }
});


router.post('/login', (req, res, next) => {
  passport.authenticate(["jwt", "local"], { session: false }, (err, user, info) => {
    if (err || !user) {
      res.status(400).json({ status: "AUTH-FAILED", data: "An Error Occurred" });
      return;
    }
    req.login(user, { session: false }, err => {
      if (err) {
        res.status(401).json({ status: "AUTH-FAILED", data: err });
        return;
      }
    });
    const token = jwt.sign(user.toJSON(), 'abc123');
    var JUser = user.toJSON();
    delete JUser.password;
    return res.json({ status: "OK", jwtToken: token, data: "Login Successful!", user: JUser });
  })(req, res);
});

router.post('/register', (req, res, next) => {
  try {
    req.body.password = passwordHash.generate(req.body.password);
    console.log(mongoose.connection.readyState);
    User.create(req.body)
      .then(result => {
        const token = jwt.sign(result.toJSON(), 'abc123');
        res.json({ 'status': 'OK', data: { user: result, 'token': token } })
      }
      ), err => res.json({ status: "FAIL", data: JSON.stringify(err) })
        .catch(error => res.json({ status: "FAIL", data: error }));
  } catch (err) {
    return res.json({ status: "FAIL", data: err.toString() });
  }
});

module.exports = router;
