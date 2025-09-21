const economicItemsModel = require("../models/economicItems");
const {
  default: getFilterParams,
  customPagination,
} = require("../helpers/getFilterParams");
const expensesModel = require("../models/expenses");
const { someUpdateFieldsExist } = require("../helpers/requiredFieldsExist");

const getAllEconomicItemsMain = async (req, res) => {
  try {
    const { page, limit, skip, filterWith } = getFilterParams(req.query, [
      "economic_code",
      "beneficiary_name",
      "beneficiary_bank",
    ]);

    const totalDocuments = await economicItemsModel.countDocuments();
    const economicItemsFound = await economicItemsModel
      .find(filterWith)
      .sort({ date_captured: 1 })
      .lean()
      .skip(skip)
      .limit(limit)
      .populate("mda_uid")
      .exec();

    let dataSent = {
      economic_items: economicItemsFound.map((item) => ({
        economic_item_uid: item._id.toString(),
        ...item,
      })),
      pagination: customPagination({ page, limit, totalDocuments }),
    };
    res.status(200).json({ status: 1, message: "Successful", data: dataSent });
  } catch (error) {
    res.status(500).json({ status: -1, message: error.message, data: [] });
  }
};

const getAllEconomicItems = async (req, res) => {
  try {
    const { page, limit, skip, filterWith } = getFilterParams(req.query, [
      "economic_code",
      "beneficiary_name",
      "beneficiary_bank",
    ]);

    const totalDocuments = await economicItemsModel.countDocuments();
    const mdasFound = await economicItemsModel.aggregate([
      { $sort: { initial_budget: -1 } },
      { $match: { ...filterWith } },
      // { $match: { status: "active", age: { $gte: 18 } } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "expenses",
          localField: "economic_code",
          foreignField: "economic_code",
          as: "expenses",
        },
      },
      {
        $addFields: {
          total_expenses: { $sum: "$expenses.gross_amount" },
        },
      },
      // Lookup mda_uid (assuming it's a ref to mdas collection)
      {
        $lookup: {
          from: "mdas", // The referenced collection
          localField: "mda_uid", // Field in economicItems
          foreignField: "_id", // Field in mdas collection
          as: "mda_info",
        },
      },

      // Optionally convert array to object if it's a one-to-one reference
      {
        $unwind: {
          path: "$mda_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          expenses: 0, // optional: hide raw expenses array
        },
      },
    ]);

    let dataSent = {
      economic_items: mdasFound.map((item) => ({
        economic_item_uid: item._id.toString(),
        ...item,
      })),
      pagination: customPagination({ page, limit, totalDocuments }),
    };

    res.status(200).json({ status: 1, message: "Successful", data: dataSent });
  } catch (error) {
    res.status(500).json({ status: -1, message: error.message, data: [] });
  }
};

// FUNCTION TO ADD NEW EXPENSE ITEM
const addEconomicItem = (req, res) => {
  const {
    economic_code,
    budget_type,
    economic_description,
    mda,
    initial_budget,
    vired_frm,
    vired_to,
    supplementary_budget,
    year,
  } = req.body;
  // if(!firstname || !lastname || !role || !email || !password){ // return if any of the fields are not returned, return failed response
  //     return res.status(400).json({status: -1, message: `Please enter all fields`, data:[]})
  // }
  //CHECK IF CODE ALREADY EXISTS OOO
  economicItemsModel
    .create(req.body)
    .then((info) => {
      res.status(201).json({
        status: 1,
        message: `Economic Item added successfully`,
        data: [info],
      });
    })
    .catch((err) => {
      res.status(500).json({ status: -1, message: err.message, data: [] });
    });
};

// FUNCTION TO DELETE EXPENSE ITEM ==> IMPLEMENT CASCADE DELETING LATER
const deleteEconomicItem = (req, res) => {
  const passedID = req.body.expense_uid;
  if (!passedID) {
    // return if no id is present in params sent
    return res
      .status(400)
      .json({ status: -1, message: `economic item ID not passed`, data: [] });
  }
  economicItemsModel
    .findByIdAndDelete(passedID)
    .then((info) => {
      if (!info) {
        return res
          .status(400)
          .json({ status: -1, message: `economic item not found`, data: [] });
      }
      res
        .status(200)
        .json({ status: 1, message: `economic item Deleted`, data: [info] });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ status: -1, message: `Server error, try again`, data: [] });
    });
};

// const updateEconomicItem = (req, res) => {
//     const passedID = req.body.economic_item_uid
//     delete req.body.economic_item_uid
//     economicItemsModel.findByIdAndUpdate(passedID, req.body, {new:true}).then((data)=>{
//         if(!data){
//             return res.status(400).json({status: 1, message: `No data updated`})
//         }
//         res.status(201).json({status: 1, message: `economic item updated successfully`, data:[data]})
//     }).catch((err)=>{
//         res.status(500).json({status: -1, message: err.message, data:[]})
//     })
// }

//WHAT HAPPENS WHEN USER CHANGES ECONOMIC CODE, ECONOMIC DESC OR MDA ==>> PLEASE LOOK INTO IT LATER

const updateEconomicItem = (req, res) => {
  // FINDS AN ECONOMIC ITEM BY ITS ID AND UPDATES IT
  const passedID = req.body.economic_item_uid; // REMOVES
  const fields = someUpdateFieldsExist(req.body, [
    "economic_code",
    "budget_type",
    "economic_description",
    "initial_budget",
    "vired_frm",
    "vired_to",
    "supplementary_budget",
    "year",
  ]);
  if (!fields) {
    return res.status(400).json({ status: 1, message: `No data updated` });
  }
  economicItemsModel
    .findByIdAndUpdate(
      passedID,
      [
        { $set: { ...fields } },
        {
          $set: {
            revised_budget: {
              $add: [
                "$vired_to",
                "$supplementary_budget",
                "$initial_budget",
                { $subtract: [0, "$vired_frm"] },
              ],
            },
          },
        },
      ],
      { new: true }
    )
    .then((data) => {
      if (!data) {
        return res.status(400).json({ status: 1, message: `No data updated` });
      }
      res.status(201).json({
        status: 1,
        message: `economic item updated successfully`,
        data: [data],
      });
    })
    .catch((err) => {
      res.status(500).json({ status: -1, message: err.message, data: [] });
    });
};

module.exports = {
  getAllEconomicItems,
  addEconomicItem,
  deleteEconomicItem,
  updateEconomicItem,
};
