const express = require("express");
const cors = require("cors");
const knex = require("knex");
const bodyParser = require("body-parser");

const db = knex({
    // **************** IMPORTANT ***************//
    // USE ENV_VARIABLES FOR THE INFORMATION BELOW!!!!! //
    client: "mysql",
    connection: {
        host : process.env.HOST,
        port : process.env.PORT,
        user : process.env.USER,
        password : process.env.PASSWORD,
        database : process.env.DB
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

app.get("/getproducts/:products", (req, res)=>{
    const { products } = req.params;
    let productArray = products.split(",").map(function(item){
        return parseInt(item);
    })
    console.log(productArray);
    db.select('ID', 'type', 'subType').from("product_types")
    .whereIn("ID", productArray)
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
});

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

app.listen(process.env.PORT, ()=>{
    console.log(`App is running on port ${process.env.PORT}`);
})