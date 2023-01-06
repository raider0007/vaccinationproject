const express=require("express")
const router=express.Router()
const {registerUser,loginUser,getUsers,checkAvailableDates,checkAvailableTiming,vaccineRegistration}=require("../controller/userController")
const {vaccineSlot}=require("../controller/vaccineController")
const {authentication,authorisation}=require("../controller/auth")

router.post("/register",registerUser)
router.post("/login",loginUser)
router.post("/vaccineSlotes",vaccineSlot)
router.get("/getUsers",getUsers)
router.get("/checkAvailableDates",checkAvailableDates)
router.get("/checkAvailableTiming",checkAvailableTiming)
router.put("/vaccineRegistration/:userId",authentication,authorisation,vaccineRegistration)

module.exports=router