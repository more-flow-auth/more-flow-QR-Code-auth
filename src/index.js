const express = require('express')
const app = express()
const getRawBody = require('raw-body')
const crypto = require('crypto')
var QRCode = require('../lib/qrcode.js');
var query_builder = require('../lib/query_builder');

const dotenv = require("dotenv");
dotenv.config();
var dbconn_default = {
	host : process.env.MYSQL_DB_URL,
	user : 'root',
	pass : '',
	dbase : process.env.DB_NAME
};

var qb = new query_builder( dbconn_default );

// var secretStrJson = {};
app.get('/', (req, res) =>{
    res.send("OK!!!!");
})
app.post('/webhooks/orders/create', async (req, res) => {
  console.log('🎉 We got an order!')

  // We'll compare the hmac to our own hash
  const hmac = req.get('X-Shopify-Hmac-Sha256')

  // Use raw-body to get the body (buffer)
  const body = await getRawBody(req)

  // Create a hash using the body and our key
  const hash = crypto
    .createHmac('sha256', process.env.SECRET_KEY)
    .update(body, 'utf8', 'hex')
    .digest('base64')

  // Compare our hash to Shopify's hash
  if (hash === hmac) {
    // It's a match! All good
    res.sendStatus(200)
    const order = JSON.parse(body.toString())
    qrStr = order["customer"]["first_name"] + "," + order["customer"]["last_name"] + "," + order["customer"]["email"];
    console.log("order info:", qrStr);
    var qrcode = new QRCode({
        content: qrStr,
        width: 128,
        height: 128,
        color: "blue",
        background: "beige",
        ecl: "H"
    });
    qb.insert(
         {
             table : process.env.TABLE_NAME,
             details : {
                 surname : order["customer"]["first_name"],
                 name : order["customer"]["last_name"],
                 email : order["customer"]["email"],
                 qr_data : qrcode.svg()
             }
         }, function(err, result, inserted_id){
             if(!! err){
                 console.log("mysql insert error : ", err)
                 return;
             }
             console.log("successfully inserted in " + inserted_id);
         }
     );
    qrcode.save("realtest.svg", function(error) {
        if (error) return console.error(error.message);
        console.log("QR Code saved!");
    });
    } else {
        // No match! This request didn't originate from Shopify
        console.log('Danger! Not from Shopify!')
        res.sendStatus(403)
    }
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))