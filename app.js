const express = require('express')
const userRouter = require('./routes/user.routes')
const port = process.env.port || 8080
const cors = require('cors')
const bodyParser = require("body-parser");

const app = express()

app.use(express.static('storage'))
app.use(cors())
app.use(express.json())
app.use('/user', userRouter)


app.listen(port, () => console.log(`server started on port ${port}`))