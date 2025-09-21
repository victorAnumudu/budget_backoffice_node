export const requiredFieldsExist = (passedFields = {}, requiredFields = []) => {
  if (!passedFields || !requiredFields.length) {
    return false;
  }else {
     const allExists = requiredFields.every(field => (passedFields[field] && Object.keys(passedFields).includes(field)))
     return allExists
  }
};


export const someUpdateFieldsExist = (reqBody = {}, updateFields = []) => {
  let someFieldsExist = {};

  if (!reqBody || !updateFields.length) {
    return false;
  }else {
     const fieldsExists = updateFields.forEach(field => {
         if(reqBody[field] && Object.keys(reqBody).includes(field)){
             return someFieldsExist[field] = reqBody[field]
         }
     })
     return Object.keys(someFieldsExist).length ? someFieldsExist : false
  }
};