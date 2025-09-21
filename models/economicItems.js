const mongoose = require('mongoose')
const mdasModel = require('./mdas')

const SCHEMA = mongoose.Schema

let economicItemsSchema = new SCHEMA({
    // org_code: {
    //     type: String,
    //     required: [true, 'org code name is required'],
    // },
    economic_code: {
        type: String,
        unique: [true, 'economic code already exists'],
    },
    budget_type: {
        type: String,
        required: [true, 'budget type name is required'],
    },
    economic_description: {
        type: String,
        required: [true, 'economic description name is required'],
    },
    mda_uid: { type: mongoose.SchemaTypes.ObjectId, ref: mdasModel },
    // mda: {
    //         "$ref" : mdasModel,
    //         "$id" : ObjectId("5126bc054aed4daf9e2ab772"),
    //         "$db" : "users",
    //         "extraField" : "anything"
    // },
    // mda: {
    //     type: String,
    //     required: [true, 'mda name is required'],
    // },
    initial_budget: {
        type: Number,
        required: [true, 'budget amount name is required'],
    },
    vired_frm: {
        type: Number,
        default: 0
    },
    vired_to: {
        type: Number,
        default: 0
    },
    supplementary_budget: {
        type: Number,
        default: 0
    },
    revised_budget: {
        type: Number,
    },
    year: {
        type: String
    }
}, {timestamps: true})


economicItemsSchema.pre('save', function(next) {
    if (this.isModified('initial_budget') || this.isModified('vired_frm') || this.isModified('vired_to') || this.isModified('supplementary_budget')) {
     this.revised_budget = this.initial_budget - this.vired_frm + this.vired_to + this.supplementary_budget
    }
    next();
});

// Post-findByIdAndUpdate hook
// economicItemsSchema.post('findByIdAndUpdate', function() {
//     const update = this.getUpdate();
//     if (update.$set && (update.$set.initial_budget || update.$set.vired_frm || update.$set.vired_to || update.$set.supplementary_budget)) {
//         const initial_budget = update.$set.initial_budget  || this.initial_budget ;
//         const vired_frm = update.$set.vired_frm || this.vired_frm;
//         const vired_to = update.$set.vired_to || this.vired_to;
//         const supplementary_budget = update.$set.supplementary_budget || this.supplementary_budget;
//         const revisedBudget = initial_budget - vired_frm + vired_to + supplementary_budget
//         this.set({ revised_budget: `${revisedBudget}` });
//     }
// });

const economicItemsModel = mongoose.model('economicitems', economicItemsSchema)

module.exports = economicItemsModel


// const sampleEconomicItem = {
//     org_code: '20007001',
//     economic_code: '20007001/22020101',
//     budget_type: 'recurrent',
//     economic_description: 'Local Travels and Transport (Training)',
//     mda_uid: '',
//     initial_budget: 20550000,
//     vired_frm: '',
//     vired_to: '',
//     supplementary_budget: '',
//      year: '',

    // total_budget: 20500000,
    // actual_expenses: 500000,
    // balance: 20000000,
//     year: '2025',
//   }


// const sampleEconomicItem = {
//     org_code: "20007001",
//     economic_code: "20007001/22020101",
//     budget_type: "recurrent",
//     economic_description: "Local Travels and Transport (Training)",
//     mda_uid: "Office of the Accountant General",
//     initial_budget: 20550000,
//     vired_frm: "",
//     vired_to: "",
//     supplementary_budget: "",
// }