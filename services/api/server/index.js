const express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    cors = require("cors"),
    dotenv = require('dotenv'),
    app = express()
// Environment Init
dotenv.config()
// Database config
const host = process.env.dbHost
const port = process.env.dbPort
const dbname = process.env.dbName
// Database config
mongoose.connect(`mongodb://${host}:${port}/${dbname}`, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
mongoose.set('useFindAndModify', false)
app.use(express.static("public"))
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(cors())
let usergroups = require('./routes/usergroups')
let menu = require('./routes/menu')
let menuPermission = require('./routes/menuPermission')
let menuPermissionAct = require('./routes/menuPermissionAct')
let login = require('./routes/login')
let spblaporan = require('./routes/spblaporan');
let spbsurat = require('./routes/spbsurat');
let spbanggota = require('./routes/spbanggota');
let spbsatker = require('./routes/spbsatker');
let spbjenissurat = require('./routes/spbjenissurat');
let spbtahapansurat = require('./routes/spbtahapansurat');
let spbuser = require('./routes/spbuser');
let apigenerator = require('./routes/apigenerator');
let apigeneratorconfig = require('./routes/apigeneratorconfig');
app.use('/si-pedi-bungas-server', usergroups)
app.use('/si-pedi-bungas-server', menu)
app.use('/si-pedi-bungas-server', menuPermission)
app.use('/si-pedi-bungas-server', login)
app.use('/si-pedi-bungas-server', menuPermissionAct)
app.use('/si-pedi-bungas-server', spblaporan);
app.use('/si-pedi-bungas-server', spbsurat);
app.use('/si-pedi-bungas-server', spbanggota);
app.use('/si-pedi-bungas-server', spbsatker);
app.use('/si-pedi-bungas-server', spbjenissurat);
app.use('/si-pedi-bungas-server', spbtahapansurat);
app.use('/si-pedi-bungas-server', spbuser);
app.use('/si-pedi-bungas-server', apigenerator);
app.use('/si-pedi-bungas-server', apigeneratorconfig);
app.listen(process.env.appPort, () => console.log(`API Service listening on port ${process.env.appPort}!`))