var express = require('express');
const User = require('../models/user');
const Action = require('../models/action');

var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/action', (req,res) => {
  Action.find({})
  .then (actions => res.json({
    success: true,
    actions: actions,
  }));
})

router.post('/action', async (req, res) => {
  try {
    let createdAction = await Action.create({
      ...req.body
    });
    if (createdAction) {
      res.json({
        success: true,
        message: "Action created successfully",
        action: createdAction
      })
    } else {
      res.json({
        success: false,
        message: "Failure"
      })
    }
  }
  catch (e) {
    res.json({
      success: false,
      message: e.toString(),
    })
  }
})


router.put('/', async (req, res) => {
  try {
    User.findOneAndUpdate({ _id: req.user._id }, req.body)
      .then(result => {
        res.json({
          success: true,
          message: "User updated successfully",
          user: result
        })
      })
      .catch(error => res.json({
        success: false,
        message: error.toString()
      }));


  } catch (e) {
    res.json({
      success: false,
      message: e.toString()
    });
  }
})
module.exports = router;
