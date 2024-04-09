// const http = require("http");
// import http from "http";
// import {generatefunc} from "./features.js";
// import fs from "fs";
// console.log(generatefunc());
// // import gfname from "./features.js";
// // import {gfname2, gfname3}  from "./features.js";
// // console.log(gfname);
// // console.log(gfname2);
// // console.log(gfname3);
// const home = fs.readFileSync("./index.html")
// const server = http.createServer((req,res)=>{
//     if(req.url=="/about"){
//         res.end(`<h1>Love is ${generatefunc()}</h1>`);
//     }
//     else if(req.url=="/"){
//         // fs.readFile("./index.html",(err,home)=>{
//         //     res.end(home);
//         // })
//         res.end(home);
//     }
//     else if(req.url=="/contacts"){
//         res.end("<h1>contact page</h1>");
//     } 
//     else{
//         res.end("<h1>page not found</h1>");
//     }
// });
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName: "backend",
}).then(() => console.log("Database Connected")).catch((e) => console.log(e));
//creating schema
// const messageSchema = new mongoose.Schema({
//     name: String,
//     email: String
// })
// //creating model/collection
// const Messge = mongoose.model("Message",messageSchema)

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})
//creating model/collection
const User = mongoose.model("User", userSchema)
const app = express();
//setting up view engine
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.set("view engine", "ejs");
const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;
    if (token) {
        const decoded = jwt.verify(token, "sdjasfdfjhdjfbdj");
        //console.log(decoded);
        req.user = await User.findById(decoded._id);
        next();
    }
    else {
        res.redirect("/login");
    }
}
const users = [];
app.get("/", isAuthenticated, (req, res) => {
    //console.log(req.user);
    res.render("logout", { name: req.user.name });
    //res.send("Hi");
    //res.sendStatus(404);
    //res.json({success: true, product:[]})
    //res.status(404).send("meri marzi");
    // const pathlocate = path.resolve();
    // res.sendFile(path.join(pathlocate,"./index.html"));
    //res.render("index",{name:"sakshi"});
    // res.sendFile("index.html")
    // const {token} = req.cookies;
    // if(token){
    //     res.render("logout");
    // }
    // else{
    //     res.render("login");
    // }
    //console.log(req.cookies);

})
app.get("/login", (req, res) => {
    res.render("login");
})
app.get("/logout", (req, res) => {
    res.cookie("token", null, { httpOnly: true, expires: new Date(Date.now()) })
    res.redirect("/");
})
app.get("/register", (req, res) => {
    res.render("register")
})
// app.get("/successfor",(req,res)=>{

//     res.render("success");

// })
// app.get("/users",(req,res)=>{
//     res.json({users});
// })
// app.get("/add",(req,res)=>{
//     Messge.create({name:"sakshi", email:"abc@gmail.com"}).then(()=>{
//         res.send("nice");
//     })
// })
// app.post("/contacts",async(req,res)=>{
//     //const messageData ={username:req.body.name,email:req.body.email};
//     //await Messge.create({name:req.body.name,email:req.body.email});
//     const {name,email} = req.body;
//     await Messge.create({name:name,email:email});
//     // console.log(req.body.name);
//     // users.push({username:req.body.name,email:req.body.email});
//     //res.render("success");
//     res.redirect("/successfor");
// })
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
        return res.redirect("/login");
    }
    //id of user
    const hashedPassword = await bcrypt.hash(password,10);
    user = await User.create({ name, email, password: hashedPassword});
    const token = jwt.sign({ _id: user._id }, "sdjasfdfjhdjfbdj"); //user ki id esehi nhi dal sakte 
    //console.log(token);
    res.cookie("token", token, { httpOnly: true, expires: new Date(Date.now() + 60 * 1000) })
    res.redirect("/");
})
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) return res.redirect("/register");
    const isMatch = await bcrypt.compare(password,user.password)
    if (!isMatch) return res.render("login", { email,message: "Incorrect Password" });
    const token = jwt.sign({ _id: user._id }, "sdjasfdfjhdjfbdj"); //user ki id esehi nhi dal sakte 
    //console.log(token);
    res.cookie("token", token, { httpOnly: true, expires: new Date(Date.now() + 60 * 1000) })
    res.redirect("/");
})

app.listen(5000, () => {
    console.log("server is working");
})