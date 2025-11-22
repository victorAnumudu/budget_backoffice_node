const warrantsModel = require("../../models/warrants")

let warrantNotGeneratedThenProceed = (req, res, next) => {
    const {warrant_id} = req.body
    if(!warrant_id){ // return if no warrant id is passed
        return res.status(400).json({status: -1, message: `warrant id is undefined`, data:[]})
    }

    warrantsModel.findById(warrant_id).then(info => {
        if(info?.status){ //if generated ie. status is 1, then retuen
           return res.status(401).json({status: -1, message: `you can't delete items from a warrant already generated.`})
        }
        next()
    }).catch(err => {
        res.status(500).json({status: -1, message: err.message})
    })
}

let warrantIsEmptyThenProceed = (req, res, next) => {
    const {warrant_id} = req.body
    if(!warrant_id){ // return if no warrant id is passed
        return res.status(400).json({status: -1, message: `warrant id is undefined`, data:[]})
    }

    warrantsModel.findById(warrant_id).then(info => {
        if(info?.expenses_id?.length){ //if expenses exists in expenses id array, then return
           return res.status(401).json({status: -1, message: `you can't delete a warrant with items.`})
        }
        next()
    }).catch(err => {
        res.status(500).json({status: -1, message: err.message})
    })
}

let warrantIsNotEmptyThenProceed = (req, res, next) => {
    const {warrant_id} = req.body
    if(!warrant_id){ // return if no warrant id is passed
        return res.status(400).json({status: -1, message: `warrant id is undefined`, data:[]})
    }

    warrantsModel.findById(warrant_id).then(info => {
        if(!info?.expenses_id?.length){ //if expenses exists in expenses id array, the return
           return res.status(401).json({status: -1, message: `you can't generate a warrant if no item(s) is/are in the warrant list`})
        }
        next()
    }).catch(err => {
        res.status(500).json({status: -1, message: err.message})
    })
}


module.exports = {warrantNotGeneratedThenProceed, warrantIsEmptyThenProceed, warrantIsNotEmptyThenProceed}