const economicItemsModel = require("../models/economicItems");
const expensesModel = require("../models/expenses");
const {
  default: getFilterParams,
  customPagination,
} = require("../helpers/getFilterParams");


const getDashboardData = async (req, res) => {
  try {
    const { page, limit, skip, filterWith } = getFilterParams(req.query, [
      "start_date",
      "end_date",
    ]);
    const startDate = "2025-01-01T00:00:00Z"
    const endDate = "2026-12-30T23:59:59Z"
    const itemsFound = await expensesModel.aggregate([
        { $sort: { budget_type: -1 } },
        {
            $match: {
                budget_type: { $in: ["recurrent", "capital"] },
                date_captured: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }
        },
        {
            $group: {
            _id: "$budget_type",
            gross_amount: { $sum: "$gross_amount" },
            net_amount: { $sum: "$net_amount" },
            }
        },
        {
            $project: {
            _id: 0,
            budget_type: "$_id",
            gross_amount: 1,
            net_amount: 1,
            }
        },
    ]);

    // Add defaults for missing budget types
    const defaultTypes = ["capital", "recurrent"];
    const resultWithDefaults = defaultTypes.map(type => {
      const found = itemsFound.find(item => item.budget_type === type);
      return found || {
        budget_type: type,
        gross_amount: 0,
        net_amount: 0
      };
    });

    let dataSent = {
      dashboard_data: resultWithDefaults.map(item => ({...item, period: 'This week'})),
    };

    res.status(200).json({ status: 1, message: "Successful", data: dataSent });
  } catch (error) {
    res.status(500).json({ status: -1, message: error.message, data: [] });
  }
};


const getDashboardDataSummaryReitred = async (req, res) => {
  try {
    const itemsFound = await expensesModel.aggregate([
        {
            $match: {
                budget_type: { $in: ["recurrent", "capital"] },
                economic_code: { $in: ["36001001/22020101", "38001001/22020101"] },
            }
        },
        {
            $facet: {
                overall: [
                    {
                    $group: {
                        _id: null,
                        total: { $sum: "$amount" },
                        avg: { $avg: "$amount" },
                        min: { $min: "$amount" },
                        max: { $max: "$amount" },
                        count: { $sum: 1 }
                    }
                    }
                ],
                by_reserve_fund: [
                    {
                    $group: {
                        _id: "$economic_code",
                        gross_amount: { $sum: "$gross_amount" },
                        net_amount: { $sum: "$net_amount" },
                        descriptions: { $first: "$economic_description" }
                    }
                    }
                ],
                by_budget_type: [
                    {
                    $group: {
                        _id: "$budget_type",
                        gross_amount: { $sum: "$gross_amount" },
                        net_amount: { $sum: "$net_amount" },
                    }
                    }
                ]
            }
        },
        {
            $project : {
                gross_amount: 0
            }
        }
    ]);

    let dataSent = {
      dashboard_summary: itemsFound,
    };

    res.status(200).json({ status: 1, message: "Successful", data: dataSent });
  } catch (error) {
    res.status(500).json({ status: -1, message: error.message, data: [] });
  }
};

const getDashboardSummaryData = async (req, res) => {
    try {
      const [recurrent_expenses, capital_expenses, contingency, common_service, revised_budget] = await Promise.all([
        expensesModel.aggregate([
          { $match: { 
              budget_type: 'recurrent',
            } 
          },
          {
            $group: {
              // _id: null,
              _id: "$budget_type",
              total_expenses: { $sum: "$gross_amount" },
            }
          },
          { $project : {_id: 0}}
        ]),
        expensesModel.aggregate([
          { $match: { 
              budget_type: 'capital',
            } 
          },
          {
            $group: {
              _id: "$budget_type",
              total_expenses: { $sum: "$gross_amount" },
            }
          },
          { $project : {_id: 0}}
        ]),

        expensesModel.aggregate([
          { $match: { economic_code: "38001001/23005700/38006000" } },
          {
            $group: {
              _id: "$economic_code",
              total_expenses: { $sum: "$gross_amount" },
            }
          },
          { $project : {_id: 0}}
        ]),
        expensesModel.aggregate([
          { $match: { economic_code: "38001001/22021013" } },
          {
            $group: {
              _id: "$economic_code",
              total_expenses: { $sum: "$gross_amount" },
            }
          },
          { $project : {_id: 0}}
        ]),
        economicItemsModel.aggregate([
          {
            $group: {
              _id: null,
              // _id: "$initial_budget",
              total_expenses: { $sum: "$revised_budget" },
            }
          },
          { $project : {_id: 0}}
        ]),
      ]);

      let dataSent = {
        capital: {...capital_expenses[0] || { total_expenses: 0}, list_order: 1, name: 'CapEx'},
        recurrent: {...recurrent_expenses[0] || { total_expenses: 0}, list_order: 2, name: 'Recurrent'},
        contingency: {...contingency[0] || { total_expenses: 0}, list_order: 3, name: 'contingency'},
        common_service: {...common_service[0] || { total_expenses: 0}, list_order: 4, name: 'Com. Service'},
        // revised_budget: {...revised_budget[0] || { total_expenses: 0}, list_order: 5, name: 'Revised Budget'},
      };
      res.status(200).json({ status: 1, message: "Successful", data: dataSent });
  } catch (error) {
    res.status(500).json({ status: -1, message: error.message, data: [] });
  }
}

const getDashboardRightPanelData = async (req, res) => {
  try {
    const [recurrent_expenses, capital_expenses, recurrent_revised_budget, capital_revised_budget, contingency, contingency_budget, common_service, common_service_budget] = await Promise.all([
      expensesModel.aggregate([
        { $match: { budget_type: 'recurrent' } },
        {
          $group: {
            // _id: null,
            _id: "$budget_type",
            total_expenses: { $sum: "$gross_amount" },
          }
        },
        { $project : {_id: 0}}
      ]),
      expensesModel.aggregate([
        { $match: { budget_type: 'capital' } },
        {
          $group: {
            _id: "$budget_type",
            total_expenses: { $sum: "$gross_amount" },
          }
        },
        { $project : {_id: 0}}
      ]),
      economicItemsModel.aggregate([
        { $match: { budget_type: 'recurrent' } },
        {
          $group: {
            // _id: null,
            _id: "$budget_type",
            revised_budget: { $sum: "$revised_budget" },
          }
        },
        { $project : {_id: 0}}
      ]),
      economicItemsModel.aggregate([
        { $match: { budget_type: 'capital' } },
        {
          $group: {
            _id: "$budget_type",
            revised_budget: { $sum: "$revised_budget" },
          }
        },
        { $project : {_id: 0}}
      ]),
      expensesModel.aggregate([
        { $match: { economic_code: "38001001/23005700/38006000" } },
        {
          $group: {
            _id: "$economic_code",
            total_expenses: { $sum: "$gross_amount" },
          }
        },
        { $project : {_id: 0}}
      ]),
      economicItemsModel.aggregate([
        { $match: { economic_code: "38001001/23005700/38006000" } },
        {
          $group: {
            _id: "$economic_code",
            revised_budget: { $sum: "$revised_budget" },
          }
        },
        { $project : {_id: 0}}
      ]),
      expensesModel.aggregate([
        { $match: { economic_code: "38001001/22021013" } },
        {
          $group: {
            _id: "$economic_code",
            total_expenses: { $sum: "$gross_amount" },
          }
        },
        { $project : {_id: 0}}
      ]),
      economicItemsModel.aggregate([
        { $match: { economic_code: "38001001/22021013" } },
        {
          $group: {
            _id: "$economic_code",
            revised_budget: { $sum: "$revised_budget" },
          }
        },
        { $project : {_id: 0}}
      ]),
    ]);

    let dataSent = {
      recurrent_expenses: {...recurrent_expenses[0] || { total_expenses: 0}, ...recurrent_revised_budget[0] || { revised_budget: 0}},
      capital_expenses: {...capital_expenses[0] || { total_expenses: 0}, ...capital_revised_budget[0] || { revised_budget: 0}},
      contingency: {...contingency[0] || { total_expenses: 0} , ...contingency_budget[0] || { revised_budget: 0}},
      common_service: {...common_service[0] || { total_expenses: 0} , ...common_service_budget[0] || { revised_budget: 0}},
    };
    Object.keys(dataSent).forEach(item => {
      dataSent[item].balance = dataSent[item].revised_budget - dataSent[item].total_expenses
    })
    res.status(200).json({ status: 1, message: "Successful", data: dataSent });
  } catch (error) {
    res.status(500).json({ status: -1, message: error.message, data: [] });
  }
};

module.exports = {
  getDashboardData,
  getDashboardSummaryData,
  getDashboardRightPanelData,
};
