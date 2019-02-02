const express = require('express');

const app = express();

app.post('/webhook/orders/create', (req, res) => {
    console.log("we got an order!");
    res.sendStatus(200);
});
app.get("/", (req, res)=>{
    console.log("index.html");
    res.send("my first project, cheer up");
    // res.sendStatus(200);
})
app.listen(3000, ()=>console.log("Example app listening on port 3000!"));