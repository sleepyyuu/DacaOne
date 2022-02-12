import { requestData } from "./apiHandler.js";
import * as chrono from "chrono-node";

let advancedParoleSubmissions = [];
let renewalSubmission = [];

let createSubmissionObject = (submissionData) => {
  let initialDate = "";
  let approvedDate = "";
  let text = "";
  let initialIndex = -1;
  let approvedIndex = -1;
  return {
    submissionData,
    initialDate,
    approvedDate,
    text,
    initialIndex,
    approvedIndex,
  };
};

let processSubmissions = async () => {
  let checkAdvancedParoleKeyWords = (submission) => {
    submission.title = submission.title.toLowerCase();
    submission.selftext = submission.selftext.toLowerCase();
    let advancedParoleKeywords = ["advanced", "advanced parole"];
    for (let keyword of advancedParoleKeywords) {
      if (submission.link_flair_text == "Advanced Parole") {
        return true;
      } else {
        if (submission.title.includes(keyword) || submission.selftext.includes(keyword)) {
          return true;
        }
      }
    }
    return false;
  };

  let extractInitialDate = (submissionObject) => {
    submissionObject.text = submissionObject.submissionData.selftext.toLowerCase();
    let applicationStartWordBank = [
      //we dont want to break loop, use word that has shortest index out of these
      "sent",
      "mailed",
      "received",
      "send",
      "submitted",
      "accepted",
      "submit",
      "receipt",
    ];
    for (let keyword of applicationStartWordBank) {
      let keywordIndex = submissionObject.text.indexOf(keyword);
      if (keywordIndex != -1) {
        let preKeywordSlice = submissionObject.text.slice(0, keywordIndex + keyword.length);
        let postKeywordSlice = submissionObject.text.slice(keywordIndex);
        if (!/\d/.test(preKeywordSlice)) {
          preKeywordSlice = "";
        }
        if (!/\d/.test(postKeywordSlice)) {
          postKeywordSlice = "";
        }
        let chronoPreResult = chrono.strict.parse(preKeywordSlice, submissionObject.submissionData.postedDate);
        let chronoPostResult = chrono.strict.parse(postKeywordSlice, submissionObject.submissionData.postedDate);
        let dateToUse;
        if (chronoPreResult.length != 0 && chronoPostResult.length != 0) {
          chronoPreResult = [chronoPreResult[chronoPreResult.length - 1]];
          //check if there is a \n or . between keyword and date
          let usePreDate = true;
          for (
            let beginningIndex = chronoPreResult[0].index;
            beginningIndex < preKeywordSlice.length;
            beginningIndex++
          ) {
            if (preKeywordSlice[beginningIndex] == "\n" || preKeywordSlice[beginningIndex] == ".") {
              usePreDate = false;
            }
          }
          let usePostDate = true;
          for (let beginningIndex = 0; beginningIndex < chronoPostResult[0].index; beginningIndex++) {
            if (postKeywordSlice[beginningIndex] == "\n" || postKeywordSlice[beginningIndex] == ".") {
              usePostDate = false;
            }
          }
          if (usePreDate == false && usePostDate == true) {
            dateToUse = chronoPostResult;
          } else if (usePreDate == true && usePostDate == false) {
            dateToUse = chronoPreResult;
          } else if (usePreDate && usePostDate) {
            //compare indexes of both, use closest
            if (keywordIndex - chronoPreResult[0].index < chronoPostResult[0].index - (keywordIndex + keyword.length)) {
              dateToUse = chronoPreResult;
            } else {
              dateToUse = chronoPostResult;
            }
          } else {
            continue;
          }
          if (dateToUse[0].index - keywordIndex > 25) {
            continue;
          }
          if (submissionObject.initialIndex == -1) {
            submissionObject.initialIndex = keywordIndex;
            submissionObject.initialDate = dateToUse[0].start.date();
          } else if (submissionObject.initialIndex > keywordIndex) {
            submissionObject.initialIndex = keywordIndex;
            submissionObject.initialDate = dateToUse[0].start.date();
          }
        } else if (chronoPreResult.length == 0 && chronoPostResult.length == 0) {
          continue;
        } else if (chronoPreResult.length != 0) {
          chronoPreResult = [chronoPreResult[chronoPreResult.length - 1]];
          dateToUse = chronoPreResult;
          if (dateToUse[0].index - keywordIndex > 25) {
            continue;
          }
          if (submissionObject.initialIndex == -1) {
            submissionObject.initialIndex = keywordIndex;
            submissionObject.initialDate = dateToUse[0].start.date();
          } else if (submissionObject.initialIndex > keywordIndex) {
            submissionObject.initialIndex = keywordIndex;
            submissionObject.initialDate = dateToUse[0].start.date();
          }
        } else if (chronoPostResult.length != 0) {
          dateToUse = chronoPostResult;
          if (dateToUse[0].index - keywordIndex > 25) {
            continue;
          }
          if (submissionObject.initialIndex == -1) {
            submissionObject.initialIndex = keywordIndex;
            submissionObject.initialDate = dateToUse[0].start.date();
          } else if (submissionObject.initialIndex > keywordIndex) {
            submissionObject.initialIndex = keywordIndex;
            submissionObject.initialDate = dateToUse[0].start.date();
          }
        }
      }
    }
    if (submissionObject.initialIndex == -1) {
      submissionObject.initialDate = "";
    }
    submissionObject.initialWord = submissionObject.text.slice(submissionObject.initialIndex);
    return submissionObject;
  };

  let extractCompletionDate = (submissionObject) => {
    let applicationEndWordBank = ["approved", "approval", "processed", "produced", "created", "produce"];
    keyWordLoop: for (let keyword of applicationEndWordBank) {
      let keywordIndex = submissionObject.text.indexOf(keyword);
      if (keywordIndex != -1) {
        let preKeywordSlice = submissionObject.text.slice(0, keywordIndex + keyword.length);
        let postKeywordSlice = submissionObject.text.slice(keywordIndex);
        if (!/\d/.test(preKeywordSlice)) {
          preKeywordSlice = "";
        }
        if (!/\d/.test(postKeywordSlice)) {
          postKeywordSlice = "";
        }
        let chronoPreResult = chrono.strict.parse(preKeywordSlice, submissionObject.submissionData.postedDate);
        let chronoPostResult = chrono.strict.parse(postKeywordSlice, submissionObject.submissionData.postedDate);
        let dateToUse;

        if (chronoPreResult.length != 0 && chronoPostResult.length != 0) {
          chronoPreResult = [chronoPreResult[chronoPreResult.length - 1]];
          //check if there is a \n or . between keyword and date
          //if another keyword matches, use the date it gets if index is bigger
          let usePreDate = true;
          for (
            let beginningIndex = chronoPreResult[0].index;
            beginningIndex < preKeywordSlice.length;
            beginningIndex++
          ) {
            if (preKeywordSlice[beginningIndex] == "\n" || preKeywordSlice[beginningIndex] == ".") {
              usePreDate = false;
            }
          }
          let usePostDate = true;
          for (let beginningIndex = 0; beginningIndex < chronoPostResult[0].index; beginningIndex++) {
            if (postKeywordSlice[beginningIndex] == "\n" || postKeywordSlice[beginningIndex] == ".") {
              usePostDate = false;
            }
          }
          if (usePreDate == false && usePostDate == true) {
            dateToUse = chronoPostResult;
          } else if (usePreDate == true && usePostDate == false) {
            dateToUse = chronoPreResult;
          } else if (usePreDate && usePostDate) {
            //compare indexes of both, use closest
            if (keywordIndex - chronoPreResult[0].index < chronoPostResult[0].index - (keywordIndex + keyword.length)) {
              dateToUse = chronoPreResult;
            } else {
              dateToUse = chronoPostResult;
            }
          } else {
            continue;
          }
          if (dateToUse[0].index - keywordIndex > 25) {
            continue;
          }
          if (submissionObject.approvedIndex == -1) {
            submissionObject.approvedIndex = keywordIndex;
            submissionObject.approvedDate = dateToUse[0].start.date();
          } else if (submissionObject.approvedIndex < keywordIndex) {
            submissionObject.approvedIndex = keywordIndex;
            submissionObject.approvedDate = dateToUse[0].start.date();
          }
        } else if (chronoPreResult.length == 0 && chronoPostResult.length == 0) {
          continue;
        } else if (chronoPreResult.length != 0) {
          chronoPreResult = [chronoPreResult[chronoPreResult.length - 1]];
          for (let beginningIndex = chronoPreResult[0].index; beginningIndex < keywordIndex; beginningIndex++) {
            if (preKeywordSlice[beginningIndex] == "\n" || preKeywordSlice[beginningIndex] == ".") {
              continue keyWordLoop;
            }
          }
          dateToUse = chronoPreResult;
          if (dateToUse[0].index - keywordIndex > 25) {
            continue;
          }
          if (submissionObject.approvedIndex == -1) {
            submissionObject.approvedIndex = keywordIndex;
            submissionObject.approvedDate = dateToUse[0].start.date();
          } else if (submissionObject.approvedIndex < keywordIndex) {
            submissionObject.approvedIndex = keywordIndex;
            submissionObject.approvedDate = dateToUse[0].start.date();
          }
        } else if (chronoPostResult.length != 0) {
          dateToUse = chronoPostResult;
          if (dateToUse[0].index - keywordIndex > 25) {
            continue;
          }
          if (submissionObject.approvedIndex == -1) {
            submissionObject.approvedIndex = keywordIndex;
            submissionObject.approvedDate = dateToUse[0].start.date();
          } else if (submissionObject.approvedIndex < keywordIndex) {
            submissionObject.approvedIndex = keywordIndex;
            submissionObject.approvedDate = dateToUse[0].start.date();
          }
        }
      }
    }
    if (submissionObject.approvedIndex == -1) {
      submissionObject.approvedDate = "";
    }
    submissionObject.approvedWord = submissionObject.text.slice(submissionObject.approvedIndex);
    return submissionObject;
  };

  let extractDateContext = (submissionObject) => {
    submissionObject.text = submissionObject.submissionData.selftext;
    if (
      submissionObject.text == "[removed]" ||
      submissionObject.text == undefined ||
      !/\d/.test(submissionObject.text)
    ) {
      submissionObject.initialDate = "";
      submissionObject.approvedDate = "";
      return submissionObject;
    } else {
      extractCompletionDate(submissionObject);
      extractInitialDate(submissionObject);
    }
    return submissionObject;
  };

  let submissionArray = await requestData();
  for (let submission of submissionArray) {
    let placeHolder = createSubmissionObject(submission);
    if (submission.selftext == "[removed]" || submission.selftext === undefined) {
      //we don't want posts that are removed/no content
      placeHolder.initialDate = "";
      placeHolder.approvedDate = "";
    } else if (checkAdvancedParoleKeyWords(submission)) {
      placeHolder = await extractDateContext(placeHolder);
      if (
        placeHolder.initialDate != "" &&
        placeHolder.approvedDate != "" &&
        placeHolder.initialDate.getTime() != placeHolder.approvedDate.getTime() &&
        placeHolder.initialDate.getTime() < placeHolder.approvedDate.getTime()
      ) {
        advancedParoleSubmissions.push(placeHolder);
      }
    } else {
      placeHolder = await extractDateContext(placeHolder);
      if (
        placeHolder.initialDate != "" &&
        placeHolder.approvedDate != "" &&
        placeHolder.initialDate.getTime() != placeHolder.approvedDate.getTime() &&
        placeHolder.initialDate.getTime() < placeHolder.approvedDate.getTime()
      ) {
        renewalSubmission.push(placeHolder);
      }
    }
  }
  return [advancedParoleSubmissions, renewalSubmission];
};

export { processSubmissions };
