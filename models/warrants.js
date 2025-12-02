const mongoose = require('mongoose')
const expensesModel = require('./expenses')

const SCHEMA = mongoose.Schema

let warrantsSchema = new SCHEMA({
    // expenses_grouped: [
    //     {
    //         expense_id: {type: mongoose.SchemaTypes.ObjectId, ref: expensesModel},
    //     }
    // ],
    expenses_id: {
        type: [mongoose.SchemaTypes.ObjectId], ref: expensesModel
    },
    status: {
        type: Number,
        default: 0
    },
    warrant_type: {
        type: String,
        default: ''
    },
    warrant_number: {
        type: String,
        default: ''
    },
    issued_by: {type: String},
    date_issued: {
        type: Date
    },
}, {timestamps: true})

const warrantsModel = mongoose.model('warrants', warrantsSchema)

module.exports = warrantsModel


// const sampleWarrant = {
//     expenses_id: []
//     status: 0,
//     issued_by : "admin@admin.com",
//     date_issued: '2025'
// }