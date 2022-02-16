import moment from "moment";
import { processSubmissions } from "./apiProcessor.js";

let initialSetup = async function () {
  let domSelectors = (() => {
    let dataDisclaimer = document.createElement("div");
    dataDisclaimer.classList.add("dataDisclaimer");
    dataDisclaimer.textContent = "Renewal Length";
    let detailDisclaimer = document.createElement("div");
    detailDisclaimer.classList.add("detailDisclaimer");
    detailDisclaimer.textContent = "Renewal Details";
    const informationContainer = document.querySelector(".informationContainer");
    let latestRenewalBox = document.createElement("div");
    latestRenewalBox.classList.add("latestRenewalBox");
    let latestRenewalLength = document.createElement("div");
    latestRenewalLength.classList.add("latestRenewalLength");
    latestRenewalLength.textContent = "The latest renewal took";
    let latestRenewalDays = document.createElement("div");
    latestRenewalDays.classList.add("latestRenewalDays");
    let latestRenewalApproved = document.createElement("div");
    latestRenewalApproved.classList.add("latestRenewalDetail");
    let latestRenewalLink = document.createElement("div");
    latestRenewalLink.classList.add("latestRenewalLink");
    const allRenewalBox = document.createElement("div");
    let averageRenewalBox = document.createElement("div");
    averageRenewalBox.classList.add("averageRenewalBox");
    let averageRenewalMonth = document.createElement("div");
    averageRenewalMonth.classList.add("averageRenewalMonths");
    let averageRenewalDays = document.createElement("div");
    averageRenewalDays.classList.add("averageRenewalDays");
    let averageRenewalDetails = document.createElement("div");
    averageRenewalDetails.classList.add("averageRenewalDetail");
    let allRenewalLength = document.createElement("div");
    allRenewalLength.classList.add("allRenewalLength");
    let allRenewalDays = document.createElement("div");
    allRenewalDays.classList.add("allRenewalDays");
    let allRenewalDetails = document.createElement("div");
    allRenewalDetails.classList.add("allRenewalDetails");
    const latestRenewalButton = document.querySelector(".latestRenewalTime");
    const averageRenewalButton = document.querySelector(".averageRenewalTime");
    const oneMonthButton = document.querySelector(".oneMonthButton");
    const sixMonthButton = document.querySelector(".sixMonthButton");
    const twelveMonthButton = document.querySelector(".twelveMonthButton");
    const allRenewalButton = document.querySelector(".allRenewalTime");
    const averageDropDownMenu = document.querySelector(".averageDropDownMenu");
    const initialApplicantAlert = document.querySelector(".initialApplicantAlert");
    return {
      dataDisclaimer,
      latestRenewalDays,
      latestRenewalLength,
      latestRenewalApproved,
      latestRenewalLink,
      averageRenewalMonth,
      averageRenewalDays,
      averageRenewalDetails,
      latestRenewalButton,
      averageRenewalButton,
      oneMonthButton,
      sixMonthButton,
      twelveMonthButton,
      allRenewalButton,
      averageDropDownMenu,
      latestRenewalBox,
      averageRenewalBox,
      allRenewalBox,
      informationContainer,
      allRenewalLength,
      allRenewalDays,
      allRenewalDetails,
      initialApplicantAlert,
      detailDisclaimer,
    };
  })();
  const submissionArray = await processSubmissions();
  const advancedParoleSubmissions = submissionArray[0];
  let renewalSubmission = submissionArray[1];
  let oneMonthArray = [];
  let threeMonthArray = [];
  let sixMonthArray = [];
  let latestRenewal = 0;
  let oneMonthSum = 0;
  let oneMonthCounter = 0;
  let threeMonthSum = 0;
  let threeMonthCounter = 0;
  let sixMonthSum = 0;
  let sixMonthCounter = 0;
  let allSum = 0;
  let allCounter = renewalSubmission.length;
  let todaysDate = moment();
  for (let submission of renewalSubmission) {
    let initialMoment = moment(submission.initialDate);
    let approvalMoment = moment(submission.approvedDate);
    let dateStaleness = todaysDate.diff(approvalMoment, "days");
    submission.processingTime = approvalMoment.diff(initialMoment, "days");
    if (submission.approvedDate.getTime() > latestRenewal) {
      latestRenewal = submission;
    }
    if (dateStaleness < 31) {
      oneMonthSum += approvalMoment.diff(initialMoment, "days");
      oneMonthCounter++;
      oneMonthArray.push(submission);
    }
    if (dateStaleness < 90) {
      threeMonthSum += approvalMoment.diff(initialMoment, "days");
      threeMonthCounter++;
      threeMonthArray.push(submission);
    }
    if (dateStaleness < 180) {
      sixMonthSum += approvalMoment.diff(initialMoment, "days");
      sixMonthCounter++;
      sixMonthArray.push(submission);
    }
    allSum += submission.processingTime;
  }
  let compareFunctionDate = (submission1, submission2) => {
    if (submission1.approvedDate.getTime() < submission2.approvedDate.getTime()) {
      return 1;
    }
    if (submission1.approvedDate.getTime() > submission2.approvedDate.getTime()) {
      return -1;
    }
    return 0;
  };
  renewalSubmission.sort(compareFunctionDate);
  threeMonthArray.sort(compareFunctionDate);
  sixMonthArray.sort(compareFunctionDate);
  let displaySubmissionTable = (submissionArray, appendingElement) => {
    let tableElement = document.createElement("table");
    tableElement.classList.add("approvalLinkTable");
    let headerRow = document.createElement("tr");
    let headerApproved = document.createElement("th");
    headerApproved.appendChild(document.createTextNode("Approved"));
    let headerProcessingTime = document.createElement("th");
    headerProcessingTime.appendChild(document.createTextNode("Length"));
    let headerLink = document.createElement("th");
    headerLink.appendChild(document.createTextNode("Link"));
    headerRow.appendChild(headerProcessingTime);
    headerRow.appendChild(headerApproved);
    headerRow.appendChild(headerLink);
    tableElement.appendChild(headerRow);

    for (let submission of submissionArray) {
      let row = document.createElement("tr");
      let approvedDate = moment(submission.approvedDate).format("M/D/YY");
      let approve = document.createElement("td");
      let approveNode = document.createTextNode(approvedDate);
      approve.appendChild(approveNode);
      let renewalLength = document.createElement("td");
      let renewalLengthText = document.createTextNode(submission.processingTime + " days");
      renewalLength.appendChild(renewalLengthText);
      let linkElement = document.createElement("a");
      linkElement.appendChild(document.createTextNode("view post"));
      linkElement.href = "https://www.reddit.com" + submission.submissionData.permalink;
      linkElement.target = "_blank";
      row.appendChild(renewalLength);
      row.appendChild(approve);
      row.appendChild(linkElement);
      tableElement.appendChild(row);
    }
    appendingElement.appendChild(tableElement);
  };
  let oneMonthAverage = Math.round(oneMonthSum / oneMonthCounter);
  let threeMonthAverage = Math.round(threeMonthSum / threeMonthCounter);
  let sixMonthAverage = Math.round(sixMonthSum / sixMonthCounter);
  let allAverage = Math.round(allSum / allCounter);

  let toggleSelectedItem = (currentElement) => {
    domSelectors.informationContainer.removeChild(domSelectors.informationContainer.lastElementChild);
    domSelectors.informationContainer.appendChild(currentElement);
  };

  domSelectors.informationContainer.removeChild(domSelectors.informationContainer.lastElementChild);
  domSelectors.informationContainer.appendChild(domSelectors.latestRenewalBox);
  let latestRenewalTimeSetup = () => {
    domSelectors.latestRenewalBox = document.createElement("div");
    domSelectors.latestRenewalBox.classList.add("latestRenewalBox");
    let initialMoment = moment(latestRenewal.initialDate);
    let approvalMoment = moment(latestRenewal.approvedDate);
    domSelectors.latestRenewalDays.textContent = approvalMoment.diff(initialMoment, "days") + " days";
    domSelectors.latestRenewalApproved.textContent =
      "Card produced/approved on " + moment(latestRenewal.approvedDate).format("M/D/YY");
    let latestRenewalLinkElement = document.createElement("a");
    latestRenewalLinkElement.appendChild(document.createTextNode("view post"));
    latestRenewalLinkElement.href = "https://www.reddit.com" + latestRenewal.submissionData.permalink;
    latestRenewalLinkElement.target = "_blank";
    domSelectors.dataDisclaimer.textContent = "Renewal Length";
    domSelectors.latestRenewalLink = document.createElement("div");
    domSelectors.latestRenewalLink.classList.add("latestRenewalLink");
    domSelectors.latestRenewalLink.appendChild(latestRenewalLinkElement);
    domSelectors.latestRenewalBox.appendChild(domSelectors.dataDisclaimer);
    domSelectors.latestRenewalBox.appendChild(domSelectors.latestRenewalLength);
    domSelectors.latestRenewalBox.appendChild(domSelectors.latestRenewalDays);
    domSelectors.latestRenewalBox.appendChild(domSelectors.detailDisclaimer);
    domSelectors.latestRenewalBox.appendChild(domSelectors.latestRenewalApproved);
    domSelectors.latestRenewalBox.appendChild(domSelectors.latestRenewalLink);
    toggleSelectedItem(domSelectors.latestRenewalBox);
  };

  let averageRenewalTimeSetup = () => {
    let setAverageRenewalDom = (month, average, counter, monthArray) => {
      domSelectors.averageDropDownMenu.style.visibility = "hidden";
      domSelectors.averageDropDownMenu.style.opacity = "0";
      domSelectors.averageRenewalBox = document.createElement("div");
      domSelectors.averageRenewalBox.classList.add("averageRenewalBox");
      domSelectors.averageRenewalMonth.textContent = "The average renewal in the past " + month + " month took";
      domSelectors.averageRenewalDays.textContent = average + " days";
      domSelectors.averageRenewalDetails.textContent = "Pulled from " + counter + " data points";
      domSelectors.averageRenewalBox.appendChild(domSelectors.dataDisclaimer);
      domSelectors.averageRenewalBox.appendChild(domSelectors.averageRenewalMonth);
      domSelectors.averageRenewalBox.appendChild(domSelectors.averageRenewalDays);
      domSelectors.averageRenewalBox.appendChild(domSelectors.detailDisclaimer);
      domSelectors.averageRenewalBox.appendChild(domSelectors.averageRenewalDetails);
      displaySubmissionTable(monthArray, domSelectors.averageRenewalBox);
      toggleSelectedItem(domSelectors.averageRenewalBox);
    };
    domSelectors.oneMonthButton.addEventListener("click", () => {
      setAverageRenewalDom("1", oneMonthAverage, oneMonthCounter, oneMonthArray);
    });
    domSelectors.sixMonthButton.addEventListener("click", () => {
      setAverageRenewalDom("3", threeMonthAverage, threeMonthCounter, threeMonthArray);
    });
    domSelectors.twelveMonthButton.addEventListener("click", () => {
      setAverageRenewalDom("6", sixMonthAverage, sixMonthCounter, sixMonthArray);
    });
  };

  let allRenewalTimeSetup = () => {
    domSelectors.allRenewalBox = document.createElement("div");
    domSelectors.allRenewalBox.classList.add("allRenewalBox");
    domSelectors.allRenewalLength.textContent = "The average renewal from ALL obtainable submissions took";
    domSelectors.allRenewalDays.textContent = allAverage + " days";
    domSelectors.allRenewalDetails.textContent = "Pulled from " + allCounter + " data points";
    domSelectors.allRenewalBox.appendChild(domSelectors.dataDisclaimer);
    domSelectors.allRenewalBox.appendChild(domSelectors.allRenewalLength);
    domSelectors.allRenewalBox.appendChild(domSelectors.allRenewalDays);
    domSelectors.allRenewalBox.appendChild(domSelectors.detailDisclaimer);
    domSelectors.allRenewalBox.appendChild(domSelectors.allRenewalDetails);
    displaySubmissionTable(renewalSubmission, domSelectors.allRenewalBox);
    toggleSelectedItem(domSelectors.allRenewalBox);
  };

  domSelectors.averageRenewalButton.addEventListener("mouseover", () => {
    domSelectors.averageDropDownMenu.style.visibility = "visible";
    domSelectors.averageDropDownMenu.style.opacity = "1";
  });
  domSelectors.averageDropDownMenu.addEventListener("mouseleave", () => {
    domSelectors.averageDropDownMenu.style.visibility = "hidden";
    domSelectors.averageDropDownMenu.style.opacity = "0";
  });
  document.querySelector(".header").addEventListener("mouseover", () => {
    domSelectors.averageDropDownMenu.style.visibility = "hidden";
    domSelectors.averageDropDownMenu.style.opacity = "0";
  });
  latestRenewalTimeSetup();
  domSelectors.latestRenewalButton.addEventListener("click", () => {
    latestRenewalTimeSetup();
  });
  averageRenewalTimeSetup();
  domSelectors.allRenewalButton.addEventListener("click", () => {
    allRenewalTimeSetup();
  });
};

export { initialSetup };
