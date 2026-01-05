const expensesModel = require('../models/expenses')
const { default: getFilterParams, customPagination } = require('../helpers/getFilterParams')


const getAllExpenses = async (req, res) => {
    
    try {
        const {page, limit, skip, filterWith} = getFilterParams(req.query, ['economic_code', 'beneficiary_name', 'beneficiary_bank', 'budget_type', 'org_code'])

        const totalDocuments = await expensesModel.countDocuments();
        const expensesFound = await expensesModel.find(filterWith).sort({ date_captured: -1 }).lean().skip(skip).limit(limit)
        let dataSent = {
            pvs: expensesFound.map(item => ({expense_uid: item._id.toString(), ...item})),
            pagination: customPagination({page, limit, totalDocuments})
        } 

        res.status(200).json({status: 1, message: 'Successful', data:dataSent})
    } catch (error) {
        res.status(500).json({status: -1, message: 'No pv found', data:[]})
    }
}


// FUNCTION TO ADD NEW EXPENSE ITEM
const addExpense = (req, res) => {
    const {
        date_captured,
        org_code,
        economic_code,
        economic_description,
        beneficiary_mda,
        pv_description,
        beneficiary_name,
        beneficiary_account,
        beneficiary_bank,
        pv_number,
        gross_amount,
        net_amount,
        budget_type,
        approval_authority,
        warrant_status,
        captured_by
    } = req.body
    // if(!firstname || !lastname || !role || !email || !password){ // return if any of the fields are not returned, return failed response
    //     return res.status(400).json({status: -1, message: `Please enter all fields`, data:[]})
    // }
    expensesModel.create(req.body).then((info)=>{
        res.status(201).json({status: 1, message: `PV added successfully`, data:[info]})
    }).catch((err)=>{
        res.status(500).json({status: -1, message: err.message, data:[]})
    })
}

// FUNCTION TO DELETE EXPENSE ITEM
const deleteExpense = (req, res) => {
    const passedID = req.body.expense_uid
    if(!passedID){ // return if no id is present in params sent
        return res.status(400).json({status: -1, message: `expense ID not passed`, data:[]})
    }
    expensesModel.findByIdAndDelete(passedID).then((info) => {
        if(!info){
            return res.status(400).json({status: -1, message: `expense not found`, data:[]})
        }
        res.status(200).json({status: 1, message: `expense Deleted`, data:[info]})
    }).catch(err => {
        res.status(500).json({status: -1, message: `Server error, try again`, data:[]})
    })
}

const updateExpense = () => {}



module.exports = {getAllExpenses, addExpense, deleteExpense, updateExpense}