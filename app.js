var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var passportLocal = require('passport-local').Strategy;
var jwtStrategy = require('passport-jwt').Strategy;
const DeviceRouter = require('./routes/device');
const DashboardRouter = require('./routes/dashboard');
const UplaodImageRouter = require('./routes/uploadimage');
var jwtExtractor = require('passport-jwt').ExtractJwt;
var indexRouter = require('./routes/index');
const TruckRouter = require('./routes/logistics');
var cron = require('node-cron');
const FarmRouter = require('./routes/farm');
const ReportRouter = require("./routes/reports");
const NotificationRouter = require("./routes/notification");
const RetailRouter = require('./routes/retail');
const SmartRouter = require('./routes/smart');
var usersRouter = require('./routes/users');
var passwordHash = require("password-hash");
const HISTORY = 0, CURRENT = 1;
const WEEKLY = 0, MONTHLY = 1, QUARTERLY = 2, YEARLY = 3;
var Sensor = require('./models/sensor');
var Report = require('./models/report');
var DataPoint = require('./models/dataPoint');
var Device = require('./models/device');
var User = require('./models/user');
var cors = require('cors');
var app = express();
const connection = mongoose.connect("mongodb://localhost:27017/analytica", { useNewUrlParser: true, useUnifiedTopology: true });
connection.then(db => {
  console.log("Connection Success!");
}, err => console.error(err));
//Setup Local Strategy of Passport
passport.use(new passportLocal({
  usernameField: 'email',
  passwordField: 'password',
},
  function (email, password, cb) {
    return User.findOne({ 'email': email })
      .then(user => {
        if (!user) {
          return cb(null, false, { message: 'Incorrect email or password' });
        }
        if (!passwordHash.verify(password, user.password)) {
          return cb(null, false, { message: 'Incorrect email or password' });
        }

        return cb(null, user, { message: 'Login Success!' });
      })
      .catch(err => cb(err));
  }
));

//Configure JWT Strategy
passport.use(new jwtStrategy(
  // {jwtFromRequest:jwtExtractor.fromBodyField("token"),secretOrKey:"abc123"},
  { jwtFromRequest: jwtExtractor.fromAuthHeaderAsBearerToken(), secretOrKey: 'abc123' },
  function (jwtPayload, cb) {
    return User.findOne({ "_id": jwtPayload._id })
      .then(user => cb(null, user))
      .catch(err => cb(err));
  }
))


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

      if (toReport) {
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
          subject: 'Your daily report'

        });

        let updatedReport = await Report.findByIdAndUpdate(report._id,{lastReportedAt: new Date()});
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
cron.schedule("0 0 0 * * *", async () => {
  let reports = await Report.find();
  Promise.all(reports.map(R => processReport(R))).then(res => {
    console.log(res.json(","))
  });
});
app.disable('etag');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//Some Comment by Aamir Another Channge
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(passport.initialize(),);
app.use(bodyParser.json());
app.use('/', indexRouter);
app.use('/users', passport.authenticate(['jwt'], { session: false }), usersRouter);
app.use('/device', passport.authenticate(['jwt'], { session: false }), DeviceRouter);
app.use('/dashboard', passport.authenticate(['jwt'], { session: false }), DashboardRouter);
app.use('/image', passport.authenticate(['jwt'], { session: false }), UplaodImageRouter);
app.use('/farm', passport.authenticate(['jwt'], { session: false }), FarmRouter);
app.use('/truck', passport.authenticate(['jwt'], { session: false }), TruckRouter);
app.use('/reports', passport.authenticate(['jwt'], { session: false }), ReportRouter);
app.use('/notification', passport.authenticate(['jwt'], { session: false }), NotificationRouter);
app.use('/retail', passport.authenticate(['jwt'], { session: false }), RetailRouter);
app.use('/smart', passport.authenticate(['jwt'], { session: false }), SmartRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

cron.schedule('0 0 0 * * *', () => {
  console.log("Schedule");
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
