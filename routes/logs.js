const express  = require('express');
const router   = express.Router();

// log model
const Log = require('../models/Log.model');

// authentication middleware
const { ensureAuthenticated, ensureAccess } = require('../config/auth');

router.get('/', ensureAuthenticated, ensureAccess("admin"), (req, res) => {
    const scripts = [
        { script: '/js/main-log.js' },
    ];
    res.render('./views_logs/listlogs', {
        scripts,
        name:            req.user.firstName,
        isAdmin:         req.user.isAdmin,
        isMember:        req.user.isMember,
        isAuthenticated: req.isAuthenticated(),
    });
});

router.get('/data', ensureAuthenticated, ensureAccess("admin"), (req, res) => {
    const agg = [
        {
            '$lookup': {
                'from': 'users',
                'localField': '_user',
                'foreignField': '_id',
                'as': 'user'
            }
        },
        {
            "$project": {
                "_id":            0,
                "type":           1,
                "createdAt":      1,
                "user.firstName": 1,   
                "user.lastName":  1,  
            }
          },
        //   { $limit : 5 }
    ];
    
    Log.aggregate(agg, (err, logs) => {
        // res.json(JSON.stringify(logs));
        res.json((logs));
    });
});

router.get('/test', (req, res) => {
    console.log(req.ip);
    res.send('test');
});

module.exports = router;