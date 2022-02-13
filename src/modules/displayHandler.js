import moment from "moment";
import { processSubmissions } from "./apiProcessor.js";

let initialSetup = async function () {
  let domSelectors = (() => {
    const informationContainer = document.querySelector(".informationContainer");
    let latestRenewalBox = document.createElement("div");
    latestRenewalBox.classList.add("latestRenewalBox");
    let latestRenewalLength = document.createElement("div");
    latestRenewalLength.classList.add("latestRenewalLength");
    latestRenewalLength.textContent = "the latest renewal took";
    let latestRenewalDays = document.createElement("div");
    latestRenewalDays.classList.add("latestRenewalDays");
    let latestRenewalApproved = document.createElement("div");
    latestRenewalApproved.classList.add("latestRenewalDetail");
    let latestRenewalLink = document.createElement("div");
    latestRenewalLink.classList.add("latestRenewalLink");
    const allRenewalBox = document.querySelector(".allRenewalBox");
    let averageRenewalBox = document.createElement("div");
    averageRenewalBox.classList.add("averageRenewalBox");
    let averageRenewalMonth = document.createElement("div");
    averageRenewalMonth.classList.add("averageRenewalMonths");
    let averageRenewalDays = document.createElement("div");
    averageRenewalDays.classList.add("averageRenewalDays");
    let averageRenewalDetails = document.createElement("div");
    averageRenewalDetails.classList.add("averageRenewalDetail");
    let averageRenewalLink = document.createElement("div");
    averageRenewalLink.classList.add("averageRenewalLink");
    const latestRenewalButton = document.querySelector(".latestRenewalTime");
    const averageRenewalButton = document.querySelector(".averageRenewalTime");
    const oneMonthButton = document.querySelector(".oneMonthButton");
    const sixMonthButton = document.querySelector(".sixMonthButton");
    const twelveMonthButton = document.querySelector(".twelveMonthButton");
    const allRenewalButton = document.querySelector(".allRenewalTime");
    const averageDropDownMenu = document.querySelector(".averageDropDownMenu");
    return {
      latestRenewalDays,
      latestRenewalLength,
      latestRenewalApproved,
      latestRenewalLink,
      averageRenewalMonth,
      averageRenewalDays,
      averageRenewalDetails,
      averageRenewalLink,
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
    };
  })();
  const submissionArray = await processSubmissions();
  const advancedParoleSubmissions = submissionArray[0];
  const renewalSubmission = submissionArray[1];
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
  let todaysDate = moment();
  for (let submission of renewalSubmission) {
    let initialMoment = moment(submission.initialDate);
    let approvalMoment = moment(submission.approvedDate);
    if (submission.approvedDate.getTime() > latestRenewal) {
      latestRenewal = submission;
    }
    if (todaysDate.diff(approvalMoment, "days") < 31) {
      oneMonthSum += approvalMoment.diff(initialMoment, "days");
      oneMonthCounter++;
      oneMonthArray.push(submission);
    }
    if (todaysDate.diff(approvalMoment, "days") < 90) {
      threeMonthSum += approvalMoment.diff(initialMoment, "days");
      threeMonthCounter++;
      threeMonthArray.push(submission);
    }
    if (todaysDate.diff(approvalMoment, "days") < 180) {
      sixMonthSum += approvalMoment.diff(initialMoment, "days");
      sixMonthCounter++;
      sixMonthArray.push(submission);
    }
  }
  let displaySubmissionTable = (submissionArray, appendingElement) => {
    let tableElement = document.createElement("table");

    for (let submission of submissionArray) {
      let row = document.createElement("tr");
      let initialDate = moment(submission.initialDate).format("M/D/YY");
      let approvedDate = moment(submission.approvedDate).format("M/D/YY");
      let bodyText = submission.text;

      let approve = document.createElement("td");
      let approveNode = document.createTextNode(approvedDate);
      approve.appendChild(approveNode);

      let body = document.createElement("td");
      let bodyNode = document.createTextNode(bodyText);
      body.appendChild(bodyNode);

      let linkElement = document.createElement("a");
      linkElement.appendChild(document.createTextNode("Reddit post link"));
      linkElement.href = "https://www.reddit.com/" + submission.submissionData.permalink;
      linkElement.target = "_blank";

      row.appendChild(approve);
      row.appendChild(linkElement);
      tableElement.appendChild(row);
    }
    appendingElement.appendChild(tableElement);
  };
  let oneMonthAverage = Math.round(oneMonthSum / oneMonthCounter);
  let threeMonthAverage = Math.round(threeMonthSum / threeMonthCounter);
  let sixMonthAverage = Math.round(sixMonthSum / sixMonthCounter);
  let toggleSelectedItem = (currentElement) => {
    domSelectors.informationContainer.removeChild(domSelectors.informationContainer.lastElementChild);
    domSelectors.informationContainer.appendChild(currentElement);
  };
  let latestRenewalTimeSetup = (() => {
    domSelectors.latestRenewalBox = document.createElement("div");
    domSelectors.latestRenewalBox.classList.add("latestRenewalBox");
    let initialMoment = moment(latestRenewal.initialDate);
    let approvalMoment = moment(latestRenewal.approvedDate);
    domSelectors.latestRenewalDays.textContent = approvalMoment.diff(initialMoment, "days") + " days";
    domSelectors.latestRenewalApproved.textContent =
      "Card produced/Approved on " + moment(latestRenewal.approvedDate).format("M/D/YY");
    let latestRenewalLinkElement = document.createElement("a");
    latestRenewalLinkElement.appendChild(document.createTextNode("Reddit post link"));
    latestRenewalLinkElement.href = "https://www.reddit.com/" + latestRenewal.submissionData.permalink;
    latestRenewalLinkElement.target = "_blank";
    domSelectors.latestRenewalLink.appendChild(latestRenewalLinkElement);
    domSelectors.latestRenewalBox.appendChild(domSelectors.latestRenewalLength);
    domSelectors.latestRenewalBox.appendChild(domSelectors.latestRenewalApproved);
    domSelectors.latestRenewalBox.appendChild(domSelectors.latestRenewalLink);
    domSelectors.informationContainer.appendChild(domSelectors.latestRenewalBox);
  })();

  let averageRenewalTimeSetup = () => {
    let setAverageRenewalDom = (month, average, counter, monthArray) => {
      domSelectors.averageRenewalBox = document.createElement("div");
      domSelectors.averageRenewalBox.classList.add("averageRenewalBox");
      domSelectors.averageRenewalMonth.textContent = "the average renewal in the past " + month + " month took";
      domSelectors.averageRenewalDays.textContent = average + " days";
      domSelectors.averageRenewalDetails.textContent = "Pulled from " + counter + " data points";
      domSelectors.averageRenewalBox.appendChild(domSelectors.averageRenewalMonth);
      domSelectors.averageRenewalBox.appendChild(domSelectors.averageRenewalDays);
      domSelectors.averageRenewalBox.appendChild(domSelectors.averageRenewalDetails);
      domSelectors.averageRenewalBox.appendChild(domSelectors.averageRenewalLink);
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

  domSelectors.latestRenewalButton.addEventListener("click", () => {
    toggleSelectedItem(domSelectors.latestRenewalBox);
  });
  averageRenewalTimeSetup();
};

export { initialSetup };
