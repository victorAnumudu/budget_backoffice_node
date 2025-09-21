const getFilterParams = (reqQuery={}, neededFilters=[]) => {

    let page = Number(reqQuery.page) >= 1 ? Number(reqQuery.page) : 1
    let limit = (Number(reqQuery.limit) && Number(reqQuery.limit) >= 1) ? Number(reqQuery.limit) : Number(10);
    let skip = (page * limit) - limit;

    const filterWith = {}

    if(!reqQuery || !neededFilters.length){
        return {}
    }else{
        Object.entries(reqQuery).forEach(([key, value])=>{
            if(neededFilters.includes(key)){
                filterWith[key] = value
            }
        })
    }
    return {page, limit, skip, filterWith}
}


export const customPagination = ({page, limit, totalDocuments}) => {
    const pagination = {
        "current_page": page,
        "has_next": (page * limit) < totalDocuments,
        "has_prev": page > 1,
        "limit": limit,
        "total_count": totalDocuments,
        "total_pages": limit >= 1 ? Math.ceil(totalDocuments/limit) : 1
        // "total_pages": limit >= 1 ? Math.round(totalDocuments/limit) + 1 : totalDocuments
    }
    return pagination
}

export default getFilterParams



