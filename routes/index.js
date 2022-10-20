const express = require('express');
const router = express.Router();
const userController = require('./users');
const auth = require('./auth_middleware');

  
//User-controller(routes)............

router.get('/loginform', userController.adminLogin);
router.get('/registerform', userController.UserRegister);

router.post('/registerform', userController.CheckUserRegister);
router.post('/loginform', userController.CheckAdminLogin); 


router.get('/admin', auth.verifyToken, userController.view);
router.post('/admin/search', auth.verifyToken, userController.find);
router.get('/admin/userInfo/:id', auth.verifyToken, userController.viewUser)
router.get('/admin/adduser', auth.verifyToken, userController.addUserForm);
router.post('/admin/adduser', auth.verifyToken, userController.create);

router.get('/admin/edituser/:id', auth.verifyToken, userController.edit);
router.post('/admin/edituser/:id', auth.verifyToken, userController.update);
router.get('/admin/deleteuser/:id', auth.verifyToken, userController.delete);



module.exports = router;
