const expensesModel = require('../models/expenses')
const economicItemsModel = require("../models/economicItems");
const warrantsModel = require("../models/warrants");

const { default: getFilterParams, customPagination } = require('../helpers/getFilterParams')

// FUNCTION TO GET ALL WARRANTS GIVEN
const getAllWarrants = async (req, res) => {
    
    try {
        const {page, limit, skip, filterWith} = getFilterParams(req.query, ['_id'])

        const totalDocuments = await warrantsModel.countDocuments();
        const warrantsFound = await warrantsModel.find(filterWith).populate({path:'expenses_id'}).sort({ date_issued: 1 }).lean().skip(skip).limit(limit)
        // const warrantsFound = await warrantsModel.find(filterWith).populate({path:'expenses_grouped.expense_details', select: ['economic_description']}).sort({ date_issued: 1 }).skip(skip).limit(limit)
        // const warrantsFound = await warrantsModel.find(filterWith).populate({path:'expenses_grouped.expense_id'}).sort({ date_issued: 1 }).lean().skip(skip).limit(limit)
        let dataSent = {
            warrants: warrantsFound,
            pagination: customPagination({page, limit, totalDocuments})
        } 

        res.status(200).json({status: 1, message: 'Successful', data:dataSent})
    } catch (error) {
        res.status(500).json({status: -1, message: 'No record found', data:[]})
    }
}


// FUNCTION TO ADD NEW WARRANT
// const addWarrant = (req, res) => {
//     const {
//         date_issued,
//         issued_by,
//         status,
//         expenses_grouped
//     } = req.body

//     if(!expenses_grouped || !issued_by){ // return if any of the fields are not returned, return failed response
//         return res.status(400).json({status: -1, message: `Please enter all fields`, data:[]})
//     }
//     warrantsModel.create(req.body).then((info)=>{
//         res.status(201).json({status: 1, message: `Warrant created successfully, you can proceed to generate`, data:[info]})
//     }).catch((err)=>{
//         res.status(500).json({status: -1, message: err.message, data:[]})
//     })
// }

const addWarrant = async (req, res) => {
    const {
        date_issued,
        issued_by,
        status,
        expenses_id
    } = req.body
    if(!expenses_id || !issued_by){ // return if any of the fields are not returned, return failed response
        return res.status(400).json({status: -1, message: `Please enter all fields`, data:[]})
    }
    const expensesIdToUpdate = expenses_id;

    try {
      const [data] = await Promise.all([
        warrantsModel.create(req.body).then(info => ({data: info})
        ).catch((err)=>{
            new Error(err.message)
        }),

        expensesModel.updateMany({ _id: { $in: expensesIdToUpdate } },{ $set: { warrant_status: 1 } }).then(info => {
            return {data: info}
        }).catch((err)=>{
            new Error(err.message)
        })
      ]);

      let dataSent = {...data};
      res.status(200).json({ status: 1, message: "Warrant created successfully, you can proceed to generate", dataSent });
  } catch (error) {
    res.status(500).json({ status: -1, message: error.message, data: [] });
  }
}

// FUNCTION TO REMOVE WARRANT ITEM
const removeWarrantItems = async (req, res) => {
    const {
        date_issued,
        issued_by,
        warrant_id,
        expenses_id
    } = req.body
    if(!warrant_id || !expenses_id || !issued_by){ // return if any of the fields are not returned, return failed response
        return res.status(400).json({status: -1, message: `Please select item(s) to remove`, data:[]})
    }
    const expensesIdToDelete = expenses_id;

    try {
      const [data] = await Promise.all([
        warrantsModel.updateOne({ _id: warrant_id }, { $pullAll: { expenses_id: expensesIdToDelete } }, {new: true}).then(info => ({data: info})
        ).catch((err)=>{
            new Error(err.message)
        }),

        expensesModel.updateMany({ _id: { $in: expensesIdToDelete } },{ $set: { warrant_status: 0 } }).then(info => {
            return {data: info}
        }).catch((err)=>{
            new Error(err.message)
        })
      ]);

      let dataSent = {...data};
      res.status(200).json({ status: 1, message: "Warrant item(s) removed successfully", dataSent });
  } catch (error) {
    res.status(500).json({ status: -1, message: error.message, data: [] });
  }
}

// FUNCTION TO DELETE AN EMPTY WARRANT
const deleteWarrant = (req, res) => {
    const {
        date_issued,
        issued_by,
        warrant_id,
    } = req.body
    if(!warrant_id || !issued_by){ // return if any of the fields are not returned, return failed response
        return res.status(400).json({status: -1, message: `warrant not identified`, data:[]})
    }

    warrantsModel.findByIdAndDelete(warrant_id).then(info => {
        if(!info){
            return res.status(400).json({status: -1, message: `warrant does not exist`, data:[]})
        }
        res.status(200).json({status: 1, message: `warrant deleted`, data:info})
    }).catch((err)=>{
        new Error(err.message)
    })
}


// FUNCTION TO UPDATE WARRANT STATUS
const updateWarrantStatus = (req, res) => {
    const {
        date_issued,
        issued_by,
        warrant_id,
    } = req.body
    if(!warrant_id || !issued_by){ // return if any of the fields are not returned, return failed response
        return res.status(400).json({status: -1, message: `warrant not identified`, data:[]})
    }

    warrantsModel.findByIdAndUpdate(warrant_id, {status: 1}, {new: true}).then(info => {
        if(!info){
            return res.status(400).json({status: -1, message: `warrant does not exist`, data:[]})
        }
        res.status(200).json({status: 1, message: `warrant updated`, data:info})
    }).catch((err)=>{
        new Error(err.message)
    })
}



module.exports = {getAllWarrants, addWarrant, removeWarrantItems, deleteWarrant, updateWarrantStatus}