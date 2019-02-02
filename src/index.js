const express = require('express')
const app = express()
const getRawBody = require('raw-body')
const crypto = require('crypto')
const secretKey = '496d5643f7467456055eb04065ed716330a97c946738014737f880fbfe208222'


var secretStrJson = {};
app.post('/webhooks/orders/create', async (req, res) => {
  console.log('🎉 We got an order!')

  // We'll compare the hmac to our own hash
  const hmac = req.get('X-Shopify-Hmac-Sha256')

  // Use raw-body to get the body (buffer)
  const body = await getRawBody(req)

  // Create a hash using the body and our key
  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(body, 'utf8', 'hex')
    .digest('base64')

  // Compare our hash to Shopify's hash
  if (hash === hmac) {
    // It's a match! All good
    console.log('Phew, it came from Shopify!')
    res.sendStatus(200)
    const order = JSON.parse(body.toString())
    // console.log("Result : ", order);
    // console.log("first name ; ", order["customer"]["first_name"]);
    // console.log("last name ; ", order["customer"]["last_name"]);
    // console.log("email address ; ", order["customer"]["email"]);
    secretStrJson = {"surname":order["customer"]["first_name"],
                     "name":order["customer"]["last_name"],
                     "mail":order["customer"]["email"]};
    console.log("info:", secretStrJson);
  } else {
    // No match! This request didn't originate from Shopify
    console.log('Danger! Not from Shopify!')
    res.sendStatus(403)
  }
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))