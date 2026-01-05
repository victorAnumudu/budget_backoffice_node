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

  if (!Object.keys(reqBody).length || !updateFields.length) {
    return false;
  }else {
     updateFields.forEach(field => {
         if(Object.keys(reqBody).includes(field)){
             someFieldsExist[field] = reqBody[field]
         }
     })
     return Object.keys(someFieldsExist).length ? someFieldsExist : false
  }
};