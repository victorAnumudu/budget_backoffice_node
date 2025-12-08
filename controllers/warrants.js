const { default: mongoose } = require('mongoose');
const expensesModel = require('../models/expenses')
const economicItemsModel = require("../models/economicItems");
const warrantsModel = require("../models/warrants");

const { default: getFilterParams, customPagination } = require('../helpers/getFilterParams');

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


// FUNCTION TO CREATE NEW WARRANT
const addWarrant = async (req, res) => {
    const {
        date_issued,
        issued_by,
        status,
        warrant_type,
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

// FUNCTION TO ADD MORE ITEMS TO EXISTING WARRANT
const addMoreItemsToWarrant = async (req, res) => {
    const {
        warrant_id,
        expenses_id
    } = req.body
    if(!expenses_id || !warrant_id){ // return if any of the fields are not returned, return failed response
        return res.status(400).json({status: -1, message: `Please enter all fields`, data:[]})
    }
    const expensesIdToUpdate = expenses_id;

    try {
      const [data] = await Promise.all([
        warrantsModel.updateOne(
        { _id: warrant_id},
        { 
            $addToSet: { 
            expenses_id: { $each: expenses_id } 
            }
        }
        ),

        expensesModel.updateMany({ _id: { $in: expensesIdToUpdate } },{ $set: { warrant_status: 1 } }).then(info => {
            return {data: info}
        }).catch((err)=>{
            new Error(err.message)
        })
      ]);

      let dataSent = {...data};
      res.status(200).json({ status: 1, message: "Items added successfully, you can proceed to generate", dataSent });
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

        expensesModel.updateMany({ _id: { $in: expensesIdToDelete } },{ $set: { warrant_status: 0, warrant_number: '' } }).then(info => {
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
const updateWarrantStatus = async (req, res) => {
    const {
        date_issued,
        issued_by,
        warrant_id,
        warrant_number,
    } = req.body
    if(!warrant_id || !issued_by || !warrant_number){ // return if any of the fields are not returned, return failed response
        return res.status(400).json({status: -1, message: `warrant not identified`, data:[]})
    }

    // warrantsModel.findOne({warrant_number}).then(info =>{
    //     if(info){
    //         return res.status(400).json({status: -1, message: `warrant number already exist`, data:[]})
    //     }
    //     warrantsModel.findByIdAndUpdate(warrant_id, {status: 1, warrant_number}, {new: true}).then(info => {
    //         if(!info){
    //             return res.status(400).json({status: -1, message: `warrant does not exist`, data:[]})
    //         }
    //         res.status(200).json({status: 1, message: `warrant updated`, data:info})
    //     }).catch((err)=>{
    //         new Error(err.message)
    //     })
    // }).catch(err => {
    //     console.log(err)
    //     return res.status(500).json({status: -1, message: `unable to complete, try again`, data:[]})
    // })


    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const warrantNumberExist = await warrantsModel.findOne({warrant_number}).session(session);
        const warrantDetails = await warrantsModel.findById(warrant_id).session(session); // GETS THE WARRANT DETAILS

        if (warrantNumberExist) { // return if warrant number already exists
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({status: -1, message: `warrant number already exist`, data:[]})
        }
        if (!warrantDetails) { // return if warrant does not exist
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({status: -1, message: `warrant does not exist`, data:[]})
        }

        await warrantsModel.updateOne(
            { _id: warrant_id },
            { $set: {status: 1, warrant_number} }
        ).session(session);

        await expensesModel.updateMany(
            { _id: { $in: warrantDetails.expenses_id } },{ $set: { warrant_status: 1, warrant_number } }
        ).session(session);

        await session.commitTransaction();
        session.endSession();
        res.status(200).json({status: 1, message: `warrant updated`, data:[]})
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({status: -1, message: `unable to complete, try again`, data:[]})
    }
}



module.exports = {getAllWarrants, addWarrant, addMoreItemsToWarrant, removeWarrantItems, deleteWarrant, updateWarrantStatus}