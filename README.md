### user-access-menu
user access menu system using passport and mongoDB (via mLab), based on Brad Traversy's YouTube tutorial using NodeJS and Passport

Link to YouTube tutorial: https://www.youtube.com/watch?v=6FOq4cUdH8k

Original githup repo: https://github.com/bradtraversy/node_passport_login

The original tutorial used EJS. I modified the app to Handlebars instead. Also incorporated:
+ bootstrap navbar with conditional menu items based on user login and admin status
+ email confirmation wiht nodemailer and  JWT
+ dotenv to store configuration infomration (ie passwords, keys, etc)
+ dtabase log when user logs in or out
+ user CRUD
+ multiple access levels: member & admin
+ momentjs for time formatting
+ bootstrap modal pop-up delete confirmation
+ field validation using express-validator
