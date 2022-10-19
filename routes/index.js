const express = require('express');
const router = express.Router();
const userController = require('./users');
const auth = require('./auth_middleware');

  
//User-controller(routes)............

router.get('/adminlogin', userController.adminLogin);
router.get('/register', userController.UserRegister);

router.post('/register', userController.CheckUserRegister);
router.post('/adminlogin', userController.CheckAdminLogin); // auth.verifyToken,


router.get('/', auth.verifyToken, userController.view);
router.post('/', auth.verifyToken, userController.find);
router.get('/userInfo/:id', auth.verifyToken, userController.viewUser)
router.get('/adduser', auth.verifyToken, userController.addUserForm);
router.post('/adduser', auth.verifyToken, userController.create);

router.get('/edituser/:id', auth.verifyToken, userController.edit);
router.post('/edituser/:id', auth.verifyToken, userController.update);
router.get('/deleteuser/:id', auth.verifyToken, userController.delete);



module.exports = router;
