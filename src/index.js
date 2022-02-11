import { requestData } from "./modules/apiHandler.js";
import { processSubmissions } from "./modules/apiProcessor.js";
import { displayList } from "./modules/displayHandler.js";
let displayInfo = async function () {
  let submissionArray = await processSubmissions();
  console.log(submissionArray);
};
displayInfo();
