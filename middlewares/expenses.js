const expensesModel = require("../models/expenses")

let expenseHasNoWarrantNumberThenProceed = (req, res, next) => {
    const passedID = req.body.expense_uid
    if(!passedID){ // return if no warrant id is passed
        return res.status(400).json({status: -1, message: `pv id is undefined`, data:[]})
    }

    expensesModel.findById(passedID).then(info => {
        if(info?.warrant_number || info?.warrant_status){ //if expense/pv has warrant number or status already, then return
            return res.status(401).json({status: -1, message: `you can't delete a pv with warrant number/status, kindly contact admin`})
        }
        next()
    }).catch(err => {
        res.status(500).json({status: -1, message: err.message})
    })
}


module.exports = {expenseHasNoWarrantNumberThenProceed}