const 	express 		= require('express'),
		mongoose   		= require('mongoose'),
		bodyParser 		= require('body-parser'),
		mongodb 		= require('mongodb')

let router = express.Router()

router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())

let spbversion = require('../models/spbversion')

router.route('/spbversion')
	.get(function(req, res){
		spbversion.find().then(data => {
            res.send(data)
        }).catch(err => {
            console.log(err)
            res.status(200).json({'status':0,'type':'error','message':err['errmsg']})
        })
	})

module.exports = router
