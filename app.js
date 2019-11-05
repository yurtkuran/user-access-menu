const express = require('express');
const exphbs  = require('express-handlebars');

// initialize app
const app = express();

// handlebars helpers
var hbs = exphbs.create({
    // Specify helpers which are only registered on this instance.
    helpers: {
        iif: function (test, yes, no) {
            return eval(test) ? yes : no;
        }
    }
});  

// handlebars middleware
app.engine('handlebars', hbs.engine, exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));