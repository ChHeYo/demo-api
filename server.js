const express = require("express");
const cors = require("cors");
const knex = require("knex");
const bodyParser = require("body-parser");

const db = knex({
    // **************** IMPORTANT ***************//
    // USE ENV_VARIABLES FOR THE INFORMATION BELOW!!!!! //
    client: "mysql",
    connection: {
        host : 'aws-us-east-1-portal.28.dblayer.com',
        port : 25338,
        user : 'webuser',
        password : 'gOAKroj4s9R2IaeuYw',
        database : 'mydb'
    }
})

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/trades/:firstKeyword/:twoDigits/:secondKeyword", (req, res)=>{
    const { firstKeyword, twoDigits, secondKeyword } = req.params;

    db.distinct("codeL6", "descriptionL6").from("vw_naics")
    .where("descriptionL6", "like", `%${firstKeyword}%`)
    .where("descriptionL2", "=", `${twoDigits}`)
    .where("descriptionL6", "like", `%${secondKeyword}%`)
    .then(data => {
        if(data.length){
            res.json(data);
        } else {
            db.distinct("codeL6", "descriptionL6").from("vw_naics")
            .where("descriptionL6", "like", `%${firstKeyword}%`)
            .where("descriptionL2", "=", `${twoDigits}`)
            .then(defaultData => {
                if (defaultData.length){
                    res.json(defaultData);
                } else {
                    res.status(400).json("Not Found")
                }
            })
            .catch(err => {
                res.status(400).json("Not Found");
            })
        }
    })
    .catch(err => {
        res.status(400).json("Not Found")
    })
})

app.get("/trades/:firstKeyword", (req, res)=>{
    const { firstKeyword } = req.params;
    db.distinct("descriptionL2").from("vw_naics")
    .where("descriptionL6", "like", `%${firstKeyword}%`)
    .then(data => {
        if(data.length){
            res.json(data);
        } else {
            res.status(400).json("Not Found")
        }
    })
    .catch(err => {
        res.status(400).json("Not Found")
    })
})

app.get("/products", (req, res)=>{
    db.select('*').from("product_types")
    .then(data => {
        if(data.length){
            res.json(data);
        } else {
            res.status(400).json("Not Found");
        }
    })
    .catch(err => {
        res.status(400).json("Not Found");
    })
})

app.get("/result/:naics/:products/:state", (req, res) => {
    const { naics, products, state } = req.params;
    let productArray = products.split(",").map(function(item){
        return parseInt(item);
    })
    db.select('*').from('vw_check_eligibility')
    .where('naics', '=', `${naics}`)
    .where('stateList', 'like', `%${state}%`)
    .whereIn('productID', productArray)
    .then(data => {
        if(data.length){
            res.json(data);
        } else {
            res.status(400).json("Not Found");
        }
    })
    .catch(err => {
        res.status(400).json("Not Found");
    })
})

app.listen(3000, ()=>{
    console.log('App is running on port 3000');
})