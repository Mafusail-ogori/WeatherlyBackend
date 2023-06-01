const database = require('../database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {secret} = require('../config')


const validateUser = async (login, mail) => {
    const userCount = await database.query(`SELECT COUNT(user_id) FROM userinfo  WHERE user_login = '${login}' 
        or user_mail = '${mail}'`);
    console.log(+userCount.rows[0].count)
    return +userCount.rows[0].count > 0
}

const addUser = async (mail, password, login) => {
    await database.query(`INSERT INTO userinfo (user_mail, user_password, user_login) 
VALUES ('${mail}', '${password}', '${login}')`)
}

const validatePassword = async (login, userPassword) => {
    const user = await database.query(`SELECT * FROM userinfo WHERE user_login = '${login}' 
        or user_mail = '${login}'`);
    return bcrypt.compareSync(userPassword, user.rows[0].user_password);
}

const getUser = async (login) => {
    const user = await database.query(`SELECT * FROM userinfo WHERE user_mail = '${login}' 
        or user_login = '${login}'`);
    return user.rows[0];
}

const generateAccessToken = (id, login) => {
    const payload = {
        id,
        login
    }
    return jwt.sign(payload, secret, {expiresIn: '24h'})
}

const addUserChoice = async (userId, cityName) => {
    return await database.query(`INSERT INTO userchoice(user_id, city_name) VALUES (${userId}, '${cityName}')`)
}

const userCartTrips = async (userId) => {
    const cities = await database.query(`SELECT * FROM trip
INNER JOIN user_choice ON userchoice.user_id = user.user_id
WHERE user_choice.user_id = ${userId}`)
    return cities.rows
}

class UserController {
    async registerUser(req, res) {
        try {
            const {mail, password, login} = req.body
            if (await validateUser(login, mail)) {
                return res.status(400).json({message: 'Found same user'})
            }
            await addUser(mail, bcrypt.hashSync(password, 7), login)
            return res.status(200).json({message: 'Added successfully'})
        } catch (e) {
            console.log(e);
            res.status(400).json({message: 'Register error'})
        }
    }

    async logInUser(req, res) {
        try {
            const {login, password} = req.body
            if (!await validateUser(login, password)) {
                return res.status(400).json({message: `User with ${login} not found`})
            }
            if (!await validatePassword(login, password)) {
                return res.status(400).json({message: `User with ${login} send not correct password`})
            }
            const user = await getUser(login)
            const token = generateAccessToken(user.user_id, user.user_login)
            return res.json({message: token})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: "Login error"})
        }
    }

    async addChoice(req, res) {
        try {
            console.log(req.body, req.user.id)
            await addUserChoice(req.user.id, req.body.city)
            res.status(200).json({message: 'added successfully'})
        } catch (e) {
            console.log(e)
            res.status(400)
        }
    }

    async getUserCart(req, res) {
        try {
            res.status(200).send(await userCartTrips(req.user.id))
        } catch (e) {
            console.log(e)
            res.status(400).json({message: "Sending user cart trips error"})
        }
    }
}

module.exports = new UserController()