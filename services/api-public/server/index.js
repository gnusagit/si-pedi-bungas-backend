const express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    cors = require("cors"),
    app = express()
// Database config
const host = "103.85.13.5"
const port = "28027"
const dbname = "si-pedi-bungas"
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
let spblaporan = require('./routes/spblaporan');
let spbsurat = require('./routes/spbsurat');
let spbanggota = require('./routes/spbanggota');
let spbsatker = require('./routes/spbsatker');
let spbjenissurat = require('./routes/spbjenissurat');
let spbtahapansurat = require('./routes/spbtahapansurat');
let spbuser = require('./routes/spbuser');
let spbversion = require('./routes/spbversion');
app.use('/si-pedi-bungas-server-public', spblaporan);
app.use('/si-pedi-bungas-server-public', spbsurat);
app.use('/si-pedi-bungas-server-public', spbanggota);
app.use('/si-pedi-bungas-server-public', spbsatker);
app.use('/si-pedi-bungas-server-public', spbjenissurat);
app.use('/si-pedi-bungas-server-public', spbtahapansurat);
app.use('/si-pedi-bungas-server-public', spbuser);
app.use('/si-pedi-bungas-server-public', spbversion);
app.listen(10435, () => console.log("API Public Service listening on port 10435!"))