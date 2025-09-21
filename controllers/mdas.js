const mdasModel = require('../models/mdas')
const expensesModel = require('../models/expenses')

const { default: getFilterParams, customPagination } = require('../helpers/getFilterParams')


// FUNCTION TO LIST MDA
const getAllMDAs = async (req, res) => {
    
    try {
        const {page, limit, skip, filterWith} = getFilterParams(req.query, ['org_code', 'mda_name', 'year'])

        const totalDocuments = await mdasModel.countDocuments();
        const mdasFound = await mdasModel.find(filterWith).sort({ mda_name: 1 }).lean().skip(skip).limit(limit)
        let dataSent = {
            mdas: mdasFound.map(item => ({mda_uid: item._id.toString(), ...item})),
            pagination: customPagination({page, limit, totalDocuments})
        } 

        // const totalDocuments = await mdasModel.countDocuments();
        // const mdasFound = await expensesModel.aggregate([
        //     {
        //         $group: {
        //             org_code: "$org_code",
        //             total: { $sum: "$gross_amount" }
        //         }
        //     },
        //     { $sort: { mda_name: 1 } },
        //     { $skip: skip },
        //     { $limit: limit }
        //     ]
        // )        
        // let dataSent = {
        //     mdas: mdasFound,
        //     pagination: customPagination({page, limit, totalDocuments})
        // }

        res.status(200).json({status: 1, message: 'Successful', data:dataSent})
    } catch (error) {
        res.status(500).json({status: -1, message: 'No mda found', data:[]})
    }
}


// FUNCTION TO ADD NEW MDA
const addMDA = async (req, res) => {
    console.log(req.body)
    const {
        org_code,
        mda_name,
        year=''
    } = req.body
    if(!org_code || !mda_name){ // return if any of the fields are not returned, return failed response
        return res.status(400).json({status: -1, message: `Please enter all fields`, data:[]})
    }
    // mdasModel.updateOne(
    // // The query filter to find a matching document
    // { org_code },
    // // The update operation. $setOnInsert ensures these fields are only set if a new document is inserted.
    // {
    //     $setOnInsert: {
    //     org_code,
    //     mda_name,
    //     year,
    //     }
    // },
    // // The upsert option. If no document matches the filter, a new one is inserted.
    // { upsert: true }
    // ).then((info)=>{
    //     res.status(201).json({status: 1, message: `mda added successfully`, data:[info]})
    // }).catch((err)=>{
    //     res.status(500).json({status: -1, message: err.message, data:[]})
    // })
    const mdaExist = await mdasModel.findOne({org_code})
    if(mdaExist){
        return res.status(401).json({status: -1, message: 'org_code and(or) mda already exist', data:[]})
    }
    mdasModel.create(req.body).then((info)=>{
        res.status(201).json({status: 1, message: `mda added successfully`, data:[info]})
    }).catch((err)=>{
        res.status(500).json({status: -1, message: err.message, data:[]})
    })
}

// FUNCTION TO DELETE MDA
//ALSO DO CASCADING DELETING
const deleteMDA = (req, res) => {
    const passedID = req.body.mda_uid
    if(!passedID){ // return if no id is present in params sent
        return res.status(400).json({status: -1, message: `mda ID not passed`, data:[]})
    }
    mdasModel.findByIdAndDelete(passedID).then((info) => {
        if(!info){
            return res.status(400).json({status: -1, message: `mda not found`, data:[]})
        }
        res.status(200).json({status: 1, message: `mda Deleted`, data:[info]})
    }).catch(err => {
        res.status(500).json({status: -1, message: `Server error, try again`, data:[]})
    })
}



const updateMDA = () => {
    //REMEMBER TO UPDATE PV RECORDS, ECONOMIC ITEM ANY TIME MDA DETAILS CHANGES
}



module.exports = {getAllMDAs, addMDA, deleteMDA, updateMDA}