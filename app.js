const express = require('express');
const exphbs  = require('express-handlebars');

// handlebars helpers library file
helpers = require('./lib/helpers');

// database
const db = require('./config/database');

// test DB
db.authenticate()
    .then(() => console.log('Database connected...'))
    .catch(err => console.log('Error: '+err));

// initialize app
const app = express();

// handlebars setup
var hbs = exphbs.create({
    helpers:       helpers,
    defaultLayout: 'main',
    partialsDir   : 'views/partials/'
});  

// handlebars middleware
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// body parser middleware
app.use(express.urlencoded({ extended: false }));

// routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));