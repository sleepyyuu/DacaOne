import { requestData } from "./apiHandler.js";

let advancedParoleSubmissions = [];
let renewalSubmission = [];

let sortSubmissions = async () => {
  let checkAdvancedParoleKeyWords = (submission) => {
    let submissionFlair = submission.link_flair_text;
    let submissionTitle = submission.title.toLowerCase();
    let submissionText = submission.selftext.toLowerCase();
    let advancedParoleKeywords = ["advanced", "parole", "advanced parole"];
    for (let keyword of advancedParoleKeywords) {
      //flair is either advanced parole or application timeline
      if (submissionFlair == "Advanced Parole") {
        return true;
      } else {
        if (
          submissionTitle.includes(keyword) ||
          submissionText.includes(keyword)
        ) {
          return true;
        }
      }
    }
    return false;
  };

  let submissionArray = await requestData();
  for (let submission of submissionArray) {
    if (
      submission.selftext == "[removed]" ||
      submission.selftext === undefined
    ) {
      //we don't want posts that are removed/no content
    } else if (checkAdvancedParoleKeyWords(submission)) {
      advancedParoleSubmissions.push(submission);
    } else {
      renewalSubmission.push(submission);
    }
  }

  console.log(advancedParoleSubmissions);
  console.log(renewalSubmission);
};

export { sortSubmissions };
