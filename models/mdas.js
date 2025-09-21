const mongoose = require('mongoose')

const SCHEMA = mongoose.Schema

let mdasSchema = new SCHEMA({
    org_code: {
        type: String,
        unique: [true, 'opps, duplicate org code'],
        required: [true, 'org code required']
    },
    mda_name: {
        type: String,
        unique: [true, 'opps, duplicate mda'],
        required: [true, 'mda name is required'],
    },
    year: {
        type: String
    },
}, {timestamps: true})

const mdasModel = mongoose.model('mdas', mdasSchema)

module.exports = mdasModel


// const sampleMDA = {
//     org_code: '20007001',
//     mda_name: 'Accountant General',
    
//     approval_authorities: ['Governor', 'Commissioner', 'Accountant General', 'Audit Clearance', 'Chief of Staff', 'SSG'],
//     recurrent: 3000000,
//     capital: 50000000,
//     year: '2025'
// }