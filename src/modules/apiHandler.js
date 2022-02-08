let requestData = async function requestData() {
  let responseArray = [];
  //utilize flair to make sure no duplicates in array
  let getSubmission = async function (url, flair) {
    let response = await fetch(url, {
      mode: "cors",
    });
    response = await response.json();
    response = response.data;
    for (let submission of response) {
      if (submission.link_flair_text == flair) {
        responseArray.push(submission);
      }
    }
  };
  await getSubmission(
    "https://api.pushshift.io/reddit/search/submission/?q='Application%20Timeline'&subreddit=DACA&after=365d&limit=100&title&sort=asc",
    "Application Timeline"
  );
  await getSubmission(
    "https://api.pushshift.io/reddit/search/submission/?q='Advanced%20Parole'&subreddit=DACA&after=365d&limit=100&title&sort=asc",
    "Advanced Parole"
  );
  return responseArray;
};

export { requestData };
