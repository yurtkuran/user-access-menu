const express  = require('express');
const router   = express.Router();

// bring in local modules
const handleValidationError = require('../lib/validationError');
const IEXCompanyProfile     = require('../lib/IEXstockProfilesCompany');

// stock model
const Stock = require('../models/Stock.model');

// sector model
const Sector = require('../models/Sector.model');

// authentication middleware
const { ensureAuthenticated, ensureAccess } = require('../config/auth.dev');

// express validator middleware
const { check, validationResult } = require('express-validator');

// sector validation
const stockValidation = [
    check('sector').not().equals('Select ETF').withMessage('Please select a sector'),
    check('symbol').not().isEmpty().withMessage('This is a required field.'),
    
    // check if symbol exists in database
    check('symbol').custom((symbol, { req }) => {
        symbol = symbol.toUpperCase();
        return Stock.findOne({ symbol }).then(stock => {
            if (stock) {
                if (stock.symbol != req.body.symbol) {
                    // symbol exists
                    return Promise.reject('Symbol already exists');
                } else {
                    return true;
                }
            }
        });
    }),
    
    // check if valid symbol by looking up in IEX trader
    check('symbol').custom(async (symbol, { req }) => {
        symbol = symbol.toUpperCase();
        responseIEX = await IEXCompanyProfile(symbol)
        
        if (!responseIEX) {
            return Promise.reject('Invalid Symbol');
        } else {
            req.body['companyName'] = responseIEX.companyName;
            return true;
        }
    }),
];

// list stocks - entry page into CRUD
router.get('/list', ensureAuthenticated, ensureAccess("admin"), (req, res) => {

    // load client script files
    const scripts = [
        { script: '/js/main-stock.js' },
    ];

    Stock.find({}).sort({symbol:1}).exec((err, stocks) => {
        if(!err) {
            res.render('./views_stocks/liststocks', {
                scripts,
                stocks,
                name:            req.user.firstName,
                isAdmin:         req.user.isAdmin,
                isMember:        req.user.isMember,
                isAuthenticated: req.isAuthenticated(),
            })
        } else {
            console.log('Error during stocks find: ' + err);
        }
    });
});

// add new stock - display addOrEdit view
router.get('/', ensureAuthenticated, ensureAccess("admin"), (req, res) => {
    Sector.find({}).sort({symbol:1}).exec((err, sectors) => {
        if(!err) {
            res.render('./views_stocks/addOrEditStock', {
                title: "Add New Stock",
                sectors,
                name:            req.user.firstName,
                isAdmin:         req.user.isAdmin,
                isMember:        req.user.isMember,
                isAuthenticated: req.isAuthenticated(),
            });

        } else {
            console.log('Error during sectors find: ' + err);
        }
    });

});

// modify existing stock - display the addOrEdit view
router.get('/:id', ensureAuthenticated, ensureAccess("admin"), async (req, res) => {
    // retrieve sector list
    sectors = await retrieveSectors();

    Stock.findById(req.params.id, (err, stock) => {
        if (!err) {
            res.render('./views_stocks/addOrEditStock', {
                title:  "Modify Stock",
                stock,
                sectors,
                name:            req.user.firstName,
                isAdmin:         req.user.isAdmin,
                isMember:        req.user.isMember,
                isAuthenticated: req.isAuthenticated(),
            });
        } else {
            console.error('Error during record find: ' + err);
        }
    });
});

// handle add/modify
router.post('/',ensureAuthenticated, ensureAccess("admin"), stockValidation, async (req, res) => {
    // process validation errors, if any
    const errors = validationResult(req).errors;
    
    // determine mode: add or edit, based on presence of id
    const mode = (req.body.id ? 'edit' : 'add');

    // retrieve sector list
    sectors = await retrieveSectors();

    if(errors.length > 0) {
        // validation fails
        handleValidationError(errors, req.body);

        res.render('./views_stocks/addOrEditStock', {
            title: (mode == 'add' ? "Add New Stock" : "Modify Stock"),
            sectors:         await retrieveSectors(),
            stock:           req.body,
            name:            req.user.firstName,
            isAdmin:         req.user.isAdmin,
            isMember:        req.user.isMember,
            isAuthenticated: req.isAuthenticated(),
        });
        
    } else {
        // validation passes, update database
        let {sector, symbol, companyName} = req.body;
        symbol = symbol.toUpperCase();      // make symbol always uppercase

        if(mode =='add') {                  // insert new record
            const newStock = new Stock({
                sector,
                symbol,
                companyName
            });
            newStock.save((err, doc) => {
                if (!err) {
                    res.redirect('/stocks/list')
                } else {
                    console.log('Error during new sector save: ' + err);
                }
            });
        } else {                            // update existing record
            Stock.findByIdAndUpdate(req.body.id, {sector, symbol, companyName}, (err, doc) => {
                if(!err) {
                    res.redirect('/stocks/list');
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

    Stock.findByIdAndDelete(req.params.id, (err, user) => {
        if (!err) {
            res.sendStatus(200);
        } else {
            console.log('Error in record delete :' + err);
            res.sendStatus(500);
        }
    });
});



// IEX trading
router.get('/IEX/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    res.json(await IEXCompanyProfile(symbol));
});

const retrieveSectors = () => {
    return Sector.find({})
                 .sort({symbol:1})
                 .select('symbol')
                 .exec();
}

module.exports = router;