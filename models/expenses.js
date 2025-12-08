const mongoose = require('mongoose')

const SCHEMA = mongoose.Schema

let expensesSchema = new SCHEMA({
    date_captured: {
        type: Date
    },
    org_code: {
        type: String,
    },
    economic_code: {
        type: String,
    },
    economic_description: {
        type: String,
    },
    beneficiary_mda: {
        type: String,
    },
    pv_description: {
        type: String,
    },
    beneficiary_name: {
        type: String,
    },
    beneficiary_account: {
        type: String,
    },
    beneficiary_bank: {
        type: String,
    },
    pv_number: {
        type: String,
    },
    gross_amount: {
        type: Number,
    },
    net_amount: {
        type: Number,
    },
    budget_type: {
        type: String,
    },
    approval_authority: {
        type: String,
    },
    warrant_status: {
       type: Number, 
       default: 0
    },
    warrant_number: {
       type: String, 
       default: ''
    },
    captured_by: {
        type: String,
        required: [true, 'email is required']
    }
})

const expensesModel = mongoose.model('expenses', expensesSchema)

module.exports = expensesModel


// const sampleExpense = {
//         id: '',
//         date_captured: '12/08/2025',
//         org_code: '20007001',
//         economic_code: '22020101',
//         economic_description: 'Local Travels and Traning',
//         beneficiary_mda: 'Office of the Accountant General',
//         pv_description: 'Fund to enable chief accountant attend ICAN meeting in Lagos',
//         beneficiary_name: 'Peter John',
//         beneficiary_account: '1010202030',
//         beneficiary_bank: 'Union',
//         pv_number: 'AG/OC/01/25',
//         gross_amount: 990000,
//         net_amount: 990000,
//         budget_type: 'recurrent',
//         approval_authority: 'Accountant General',
//         captured_by: 'admin@admin.com'
// }