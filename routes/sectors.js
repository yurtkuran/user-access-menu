const express  = require('express');
const router   = express.Router();

// bring in helper functions
const handleValidationError = require('../lib/validationError');

// sector model
const Sector = require('../models/Sector.model');

// authentication middleware
const { ensureAuthenticated, ensureAccess } = require('../config/auth.dev');

// express validator middleware
const { check, validationResult } = require('express-validator');

// sector validation
const sectorValidation = [
    check('symbol').not().isEmpty().withMessage('This is a required field.'),
    check('name').not().isEmpty().withMessage('This is a required field.'),
    check('description').not().isEmpty().withMessage('This is a required field.'),
    check('symbol').custom((symbol, { req }) => {
        // check if symbol exists in database
        symbol = symbol.toUpperCase();
        return Sector.findOne({ symbol }).then(sector => {
            if (sector) {
                if (sector.id != req.body.id) {
                    // symbol exists
                    return Promise.reject('Symbol already exists');
                } else {
                    return true;
                }
            }
        });
    }),
];

// list sectors - entry page into CRUD
router.get('/list', ensureAuthenticated, ensureAccess("admin"), (req, res) => {

    // load client script files
    const scripts = [
        { script: '/js/main-sector.js' },
    ];

    Sector.find({}).sort({symbol:1}).exec((err, sectors) => {
        if(!err) {
            res.render('./views_sectors/listsectors', {
                scripts,
                sectors,
                name:            req.user.firstName,
                isAdmin:         req.user.isAdmin,
                isMember:        req.user.isMember,
                isAuthenticated: req.isAuthenticated(),
            })
        } else {
            console.log('Error during sectors find: ' + err);
        }
    });
});

// add new sector - display the addOrEdit sector view
router.get('/', ensureAuthenticated, ensureAccess("admin"), (req, res) => {
    res.render('./views_sectors/addOrEditSector', {
        title:  "Add New Sector",
        name:            req.user.firstName,
        isAdmin:         req.user.isAdmin,
        isMember:        req.user.isMember,
        isAuthenticated: req.isAuthenticated(),
    });
});

// modify existing sector - display the addOrEdit sector view
router.get('/:id', ensureAuthenticated, ensureAccess("admin"), (req, res) => {
    Sector.findById(req.params.id, (err, sector) => {
        if (!err) {
            res.render('./views_sectors/addOrEditSector', {
                title:  "Modify Sector",
                sector,
                name:            req.user.firstName,
                isAdmin:         req.user.isAdmin,
                isMember:        req.user.isMember,
                isAuthenticated: req.isAuthenticated(),
            });
        } else {
            console.log('Error during record find: ' + err);
        }
    });
});

// handle add/modify sector
router.post('/',ensureAuthenticated, ensureAccess("admin"), [sectorValidation], (req, res) => {
    
    // process validation errors, if any
    const errors = validationResult(req).errors;

    // determine mode: add or edit, based on presence of id
    const mode = (req.body.id ? 'edit' : 'add');
    
    if(errors.length > 0) {
        // validation fails
        handleValidationError(errors, req.body);

        res.render('./views_sectors/addOrEditSector', {
            title:  (mode == 'add' ? "Add New Sector" : "Modify Sector"),
            sector: req.body,
            name:            req.user.firstName,
            isAdmin:         req.user.isAdmin,
            isMember:        req.user.isMember,
            isAuthenticated: req.isAuthenticated(),
        });
        
    } else {
        // validation passes, update database
        let {symbol, name, description} = req.body;
        symbol = symbol.toUpperCase();      // make symbol always uppercase

        if(mode =='add') {                  // insert new record
            const newSector = new Sector({
                symbol,
                name,
                description
            });
            newSector.save((err, doc) => {
                if (!err) {
                    res.redirect('/sectors/list')
                } else {
                    console.log('Error during new sector save: ' + err);
                }
            });
        } else {                            // update existing record
            Sector.findByIdAndUpdate(req.body.id, {symbol, name, description}, (err, doc) => {
                if(!err) {
                    res.redirect('/sectors/list');
                } else {
                    console.log('Error during record update: ' + err);
                }
            });
        }
    }
});

// handle delete record
router.delete('/:id', ensureAuthenticated, ensureAccess("admin"), (req, res) => {
    // console.log('ID to be removed: ' + req.params.id);

    Sector.findByIdAndDelete(req.params.id, (err, user) => {
        if (!err) {
            res.sendStatus(200);
        } else {
            console.log('Error in record delete :' + err);
            res.sendStatus(500);
        }
    });
});

module.exports = router;