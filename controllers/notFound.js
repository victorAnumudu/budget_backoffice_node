const notFound = (req, res) => {
    res.status(404).json({status: -1, message:'Failed', data:[]})
}

module.exports = notFound