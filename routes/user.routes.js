const Router = require('express')
const userRouter = new Router()
const userController = require('../controllers/user.controller')
const auth = require('../authMiddleWare')

userRouter.post('/sign-up', userController.registerUser);
userRouter.post('/log-in', userController.logInUser);
userRouter.post('/user-choose-trip', auth, userController.addChoice)
userRouter.get('/user-cart-trips', auth, userController.getUserCart)

module.exports = userRouter