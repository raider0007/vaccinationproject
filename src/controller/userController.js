const { hash } = require("bcrypt")
const userModel = require("../models/userModel")
const { isValidString, isValidName, isValidMobile, isValidPincode, isValidAadharNumber, isValidPassword } = require("../validator/validator")
const { sign } = require("jsonwebtoken")
const vaccineSlotModel = require("../models/vaccineModel")

exports.registerUser = async (req, res) => {
    try {
        let requestBody = Object.keys(req.body)
        if (requestBody.length == 0) return res.status(400).send({ status: false, message: "please provide some data for register user" })
        let itsMandatory = ["name", "phoneNumber", "password", "age", "pincode", "aadhar_No"]
        itsMandatory.map((x) => {
            if (!requestBody.includes(x)) return res.status(400).send({ status: false, message: `${x} is mandatory` })
        })
        const { name, phoneNumber, age, pincode, aadhar_No, password } = req.body
        if (name) {
            if (!isValidString(name) || !isValidName(name)) return res.status(400).send({ status: false, message: "please provide valid name" })
        }
        if (phoneNumber) {
            if (!isValidMobile(phoneNumber)) return res.status(400).send({ status: false, message: "please provide valid number" })
            let itsUnique = await userModel.findOne({ phoneNumber: phoneNumber, isDeleted: false })
            if (itsUnique) return res.status(400).send({ status: false, message: "this number is already exists" })
        }
        if (password) {
            if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "please provide valid or strong password" })
            req.body.password = await hash(password, 10)
        }
        if (age) {
            if (typeof age != "number") return res.status(400).send({ status: false, message: "age should be only Number" })
        }
        if (pincode) {
            if (!isValidPincode(pincode)) return res.status(400).send({ status: false, message: "please provide valid pincode" })
        }
        if (aadhar_No) {
            if (!isValidAadharNumber(aadhar_No)) return res.status(400).send({ status: false, message: "please provide the valid aadhar number" })
            let itsUnique = await userModel.findOne({ aadhar_No: aadhar_No, isDeleted: false })
            if (itsUnique) return res.status(400).send({ status: false, message: "this aadhar_No is already exists" })
        }
        let createUser = await userModel.create(req.body)
        return res.status(201).send({ status: true, message: "user register successfully", data: createUser })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

exports.loginUser = async (req, res) => {
    try {
        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "request body is empty !!" })
        const { phoneNumber, password } = req.body

        if (!phoneNumber) return res.status(400).send({ status: false, message: "please provide the mobile Number" })
        if (!isValidMobile(phoneNumber)) return res.status(400).send({ status: false, message: "please provide the valid mobile Number" })
        let user = await userModel.findOne({ phoneNumber })
        if (!user) return res.status(400).send({ status: false, message: "this phoneNumber is not exists in database" })
        if (!password) return res.status(400).send({ status: false, message: "please provide the password" })
        let pass = await hash(password, user.password)
        if (!pass) return res.status(400).send({ status: false, message: "Incorrect password !!" })

        let token = sign({ userId: user._id.toString() }, `${process.env.SECREAT_KEY}`, { expiresIn: "5h" })
        let responceData = { userId: user._id, token: token }
        return res.status(200).send({ status: true, message: "user login successfully", data: responceData })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

exports.getUsers = async (req, res) => {
    try {
        let query = Object.keys(req.query)
        if (query.length > 0) {
            let itsValid = ["age", "Vaccination_status", "pincode"]
            query.map((x) => {
                if (!itsValid.includes(x)) return res.status(400).send({ status: false, message: `${x} is not valid key for filter the data` })
            })
            req.query.isDeleted = false
            let filter = req.query
            let users = await userModel.find(filter)
            if (users.length == 0) return res.status(404).send({ status: false, message: "no any user found" })
            return res.status(200).send({ status: true, message: "list of users", data: users })
        } else {
            let users = await userModel.find({ isDeleted: false })
            if (users.length == 0) return res.status(404).send({ status: false, message: "no any user found" })
            return res.status(200).send({ status: true, message: "list of users", data: users })
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


exports.checkAvailableDates = async (req, res) => {
    try {
        let vaccineSlot = await vaccineSlotModel.find({ isAvalaible: true }).select({ date: 1, _id: 0 })
        if (vaccineSlot.length == 0) return res.status(404).send({ status: false, message: "no any slots found" })
        return res.status(200).send({ status: true, message: "list of available dates for vaccination", dates: vaccineSlot })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}

exports.checkAvailableTiming = async (req, res) => {
    try {
        const { date } = req.body
        let vaccineSlot = await vaccineSlotModel.findOne({ isAvalaible: true, date: date })
        let availableVaccines = vaccineSlot.availableVaccines
        let availableTiming = []
        for (let key in availableVaccines) {
            const element = availableVaccines[key];
            if (element.vaccineDoses < 10 && element.isBooked == false) {
                availableTiming.push(key)
            }
        }
        if (availableTiming.length == 0) { return res.status(400).send({ status: false, message: `no any time available in ${date}` }) }
        let responceData = { Date: vaccineSlot.date, availableTiming: availableTiming }
        return res.status(200).send({ status: true, message: `list of available timing for ${date} `, results: responceData })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}

exports.vaccineRegistration = async (req, res) => {
    const { userId } = req.params
    const { date, time } = req.body
    let bookSlots = await vaccineSlotModel.findOneAndUpdate({ date: date })
    let availableTiming = bookSlots.availableVaccines
    for (let key in availableTiming) {
        const element = availableTiming[key];
        if (key == time && element.isBooked == false) {
            element.vaccineDoses++
            if (element.vaccineDoses >= 10) {
                element.isBooked = true
            }
        }
    }
    let status = { Vaccination_status: "none" }
    if (req.user.Vaccination_status == "none") { status.Vaccination_status = "firstDose" }
    if (req.user.Vaccination_status == "firstDose") { status.Vaccination_status = "secondDose" }

    await vaccineSlotModel.findOneAndUpdate({ date: date }, { availableVaccines: availableTiming }, { new: true })
    await userModel.findOneAndUpdate({ _id: userId }, status)
    return res.status(200).send({ status: true, message: `${req.user.name} have successfully register for ${status.Vaccination_status} on ${date}${time}` })
}