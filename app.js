const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mysql = require('mysql');
const hbs = require('hbs');
const session = require('express-session');
var flash = require('express-flash');
require('dotenv').config()
//requiring routes files....
let indexRouter = require('./routes/index');


let app = express();

app.use(flash());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');



//connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: '',
  database: process.env.DB_NAME
});
//connect to DB.....
pool.getConnection((error, connection) => {
  if (error) throw error;
  console.log('Connection ID: ' + connection.threadId);
});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//flash setup
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  }));


//using Express router files
app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

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
