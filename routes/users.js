const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const { isEmpty } = require('lodash');
const Validator = require('is_js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const secret_key = 'hackedPassword123';
const saltRounds = 10;


//connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'testcase01'
});

// function validator(data) {
//   let errors = {};
//   if (data.first_name && Validator.empty(data.first_name)) {
//     errors.first_name = 'FirstName is required!';
//   }
//   if (data.last_name && Validator.empty(data.last_name)) {
//     errors.last_name = 'LastName is required!';
//   }
//   if (data.email && Validator.empty(data.email)) {
//     errors.email = 'Email is required!';
//   }
//   if (data.contact && Validator.empty(data.contact)) {
//     errors.contact = 'Contact is required!';
//   }
//   return {
//     isValid: isEmpty(errors), errors
//   };
// }

function validator(data) {
  let errors = {};
  if (Validator.empty(data.first_name)) {
    errors.first_name = 'FirstName is required!';
  }
  if (Validator.empty(data.last_name)) {
    errors.last_name = 'LastName is required!';
  }
  if (Validator.empty(data.email)) {
    errors.email = 'Email is required!';
  }
  if (Validator.empty(data.contact)) {
    errors.contact = 'Contact is required!';
  }
  return {
    isValid: isEmpty(errors), errors
  };
}



//view database.............
exports.view = (req, res, next) => {
  //connect to DB.....
  pool.getConnection((error, connection) => {
    if (error) throw error;
    console.log('Connection ID: ' + connection.threadId);
    //use the connection
    connection.query("SELECT * FROM userinformation", (error, results) => {
      //when done with connection release it......
      connection.release();
      if (!error) {
        res.render('index', { results });
      }
      else {
        console.log(error);
      }
    });
  });
}

exports.adminLogin = (req, res) => {
  res.render('login');
}

exports.UserRegister = (req, res) => {
  res.render('register');
}

exports.CheckUserRegister = (req, res) => {
  const { name, email, contact, address, password, passwordConfirm } = req.body;
  if (password === passwordConfirm) {
    //check for existing email account
    //hashing password
    const hashPassword = bcrypt.hashSync(password, saltRounds);
    pool.getConnection((error, connection) => {
      if (error) throw error;
      connection.query('INSERT INTO userdata SET name = ?, email = ?, contact = ?, address = ?, password = ?', [name, email, contact, address, hashPassword], (error, results) => {
        connection.release();
        if (!error) {
          res.render('register', { alert: "User sucessfully register!" });
        }
        else {
          console.log(error);
        }
      });
    });
  }
  else {
    res.render('register', { alert: "Passwords does not matched!" });
  }

}

exports.CheckAdminLogin = (req, res, next) => {
  const { user, lpassword } = req.body;

  pool.getConnection((error, connection) => {
    if (error) throw error;
    connection.query(`SELECT * FROM admin`, (error, results) => {
      connection.release();
      if (!error) { 
        const status = results.find((ele) => {
          if (ele.userID == user && ele.password == lpassword){
            return true;
          } 
        });
        if (status){
          // console.log(status.userID);
          //creating token using jwt;
          const token = jwt.sign({UserID: status.admin_id}, secret_key);
        // res.cookie('jwt', token);
        req.session.jwt = token;
        req.session.save();
          pool.getConnection((error, connection) => {
            if (error) throw error;
            connection.query("SELECT * FROM userinformation", (error, results) => {
              connection.release();
              if (!error) {   
                req.header('Authorization', 'Bearer '+ token);          
                res.render('index', { results, alert: 'Succesfully login!' });
              }
              else {
                console.log(error);
              }
            });
          });
        }
        else{
          res.render('login', { alert: "Invalid credentials!" });
        }
      }
      else {
        console.log(error);
      }
    });
  });
  

}

//view user information on about page
exports.viewUser = (req, res) => {
  pool.getConnection((error, connection) => {
    connection.query("SELECT * FROM userinformation WHERE id = ?", [req.params.id], (error, results) => {
      connection.release();
      if (!error) {
        // console.log(results);
        // results = JSON.stringify(results);
        // let user = results[0].first_name +' '+ results[0].last_name;
        res.render('aboutPage', { results });
      }
      else {
        console.log(error);
      }

    })
  })
}

//find using first and last name of the user in search box
exports.find = (req, res) => {
  //get data.....
  let search = req.body.search;
  //connect to DB.....
  pool.getConnection((error, connection) => {
    if (error) throw error;
    //use the connection
    connection.query("SELECT * from userinformation WHERE first_name LIKE ? OR last_name LIKE ?", [search + '%', search + '%'], (error, results) => {
      connection.release();
      if (!error) {
        res.render('index', { results });
      }
      else {
        console.log(error);
      }
    });
  });
}

//opens add users form
exports.addUserForm = (req, res) => {
  res.render('addUser');
}

//create new user using form data
exports.create = (req, res) => {

  let { isValid, errors } = validator(req.body);
  if (!isValid) {
    res.render('addUser', {
      err: errors,
      user: {
        firstname: req.body.first_name,
        lastname: req.body.last_name,
        email: req.body.email,
        contact: req.body.contact
      }
    });
  }
  else {
    const { first_name, last_name, contact, email } = req.body;
    pool.getConnection((error, connection) => {
      if (error) throw error;
      connection.query("INSERT INTO userinformation SET first_name = ?, last_name = ?, contact = ?, email = ? ", [first_name, last_name, contact, email], (error, results) => {
        connection.release();
        if (!error) {
          // req.session.message = {input:"sucess", intro:"Record created", message:"New record is created!"}
          req.flash('success', 'User Created successfully!');
          res.redirect('addUser');
        }
        else {
          console.log(error);
        }
      });
    });
  }
}

//opens edit page of a particular user id
exports.edit = (req, res) => {

  //connect to DB.....
  pool.getConnection((error, connection) => {
    if (error) throw error;
    console.log('Connection ID: ' + connection.threadId);
    //use the connection
    connection.query("SELECT * FROM userinformation WHERE id = ?", [req.params.id], (error, results) => {
      connection.release();
      if (!error) {
        res.render('edit-user', { results });
      }
      else {
        console.log(error);
      }
    });
  });
}

//update the existing user data using form data
exports.update = (req, res) => {
  //get data.....
  const { first_name, last_name, contact, email } = req.body;
  if (req.body.first_name == "" && req.body.last_name == "" && req.body.contact == "" && req.body.email == "") {
    // req.session.message = { type:'danger', intro:'Empty space!', message:'Please fill all information of the user'};
    pool.getConnection((error, connection) => {
      if (error) throw error;
      connection.query("SELECT * FROM userinformation WHERE id = ?", [req.params.id], (error, results) => {
        connection.release();
        if (!error) {
          res.render('edit-user', { results, alert: "Please fill all the requested information" });
        }
        else {
          console.log(error);
        }
      });
    });
  }
  else if (req.body.first_name == "") {
    // req.session.message = { type:'danger', intro:'Empty space!', message:'Please fill all information of the user'}; 
    pool.getConnection((error, connection) => {
      if (error) throw error;
      connection.query("SELECT * FROM userinformation WHERE id = ?", [req.params.id], (error, results) => {
        connection.release();
        if (!error) {
          res.render('edit-user', { results, alert: 'Please enter the username' });
        }
        else {
          console.log(error);
        }
      });
    });
  }
  else if (req.body.last_name == "") {
    pool.getConnection((error, connection) => {
      if (error) throw error;
      connection.query("SELECT * FROM userinformation WHERE id = ?", [req.params.id], (error, results) => {
        connection.release();
        if (!error) {
          res.render('edit-user', { results, alert: "Last name cannot be empty" });
        }
        else {
          console.log(error);
        }
      });
    });
  }
  else if (req.body.email == "") {
    pool.getConnection((error, connection) => {
      if (error) throw error;
      connection.query("SELECT * FROM userinformation WHERE id = ?", [req.params.id], (error, results) => {
        connection.release();
        if (!error) {
          res.render('edit-user', { results, alert: "Please add email id" });
        }
        else {
          console.log(error);
        }
      });
    });
  }
  else if (req.body.contact == "") {
    pool.getConnection((error, connection) => {
      if (error) throw error;
      connection.query("SELECT * FROM userinformation WHERE id = ?", [req.params.id], (error, results) => {
        connection.release();
        if (!error) {
          res.render('edit-user', { results, alert: "Contact Info cannot be empty" });
        }
        else {
          console.log(error);
        }
      });
    });
  }
  else {
    pool.getConnection((error, connection) => {
      if (error) throw error;
      connection.query("UPDATE userinformation SET first_name = ?, last_name = ?, contact = ?, email = ? WHERE id = ?", [first_name, last_name, contact, email, req.params.id], (error, results) => {
        connection.release();
        if (!error) {
          pool.getConnection((error, connection) => {
            if (error) throw error;
            connection.query("SELECT * FROM userinformation WHERE id = ?", [req.params.id], (error, results) => {
              connection.release();
              if (!error) {
                res.render('edit-user', { results, alert: `${req.body.first_name} data updated` });
              }
              else {
                console.log(error);
              }
            });
          });
        }
        else {
          console.log(error);
        }
      });
    });
  }
}

//delete a particular user using user id
exports.delete = (req, res) => {
  pool.getConnection((error, connection) => {
    if (error) throw error;
    connection.query("DELETE FROM userinformation WHERE id = ?", [req.params.id], (error, results) => {
      connection.release();
      if (!error) {
        res.redirect("/adminlogin");
      }
      else {
        console.log(error);
      }
    })
  });
}




