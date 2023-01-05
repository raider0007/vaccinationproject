const express = require('express');
const Router = express.Router();

const usercontroller = require("../controllers/userControllers")



//--------------------------------ti-----------
Router.post("/user",usercontroller.createUser)
