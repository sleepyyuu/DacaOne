import moment from "moment";

let displayList = (submissionArray) => {
  let tableElement = document.createElement("table");
  for (let submission of submissionArray[1]) {
    let row = document.createElement("tr");
    let initialDate = moment(submission.initialDate).format("M/D/YY");
    let approvedDate = moment(submission.approvedDate).format("M/D/YY");
    let bodyText = submission.text;

    let initial = document.createElement("td");
    let initialNode = document.createTextNode(initialDate);
    initial.appendChild(initialNode);

    let approve = document.createElement("td");
    let approveNode = document.createTextNode(approvedDate);
    approve.appendChild(approveNode);

    let body = document.createElement("td");
    let bodyNode = document.createTextNode(bodyText);
    body.appendChild(bodyNode);

    row.appendChild(initial);
    row.appendChild(approve);
    row.appendChild(body);
    tableElement.appendChild(row);
  }
  document.body.appendChild(tableElement);
};

export { displayList };
