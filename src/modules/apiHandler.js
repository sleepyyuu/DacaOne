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
        submission.postedDate = new Date(1000 * submission.created_utc);
        responseArray.push(submission);
      }
    }
  };

  let getComments = async function (url) {
    let response = await fetch(url, {
      mode: "cors",
    });
    response = await response.json();
    response = response.data;
    for (let comment of response) {
      comment.selftext = comment.body;
      comment.title = comment.selftext;
      comment.link_flair_text = "";
      comment.postedDate = new Date(1000 * comment.created_utc);
      responseArray.push(comment);
    }
  };

  Promise.all([
    await getSubmission(
      "https://api.pushshift.io/reddit/search/submission/?q='Application%20Timeline'&subreddit=DACA&after=365d&limit=100&title&sort=desc&sort_type=created_utc",
      "Application Timeline"
    ),
    await getSubmission(
      "https://api.pushshift.io/reddit/search/submission/?q='Advanced%20Parole'&subreddit=DACA&after=365d&limit=100&title&sort=desc&sort_type=created_utc",
      "Advanced Parole"
    ),

    await getComments(
      "https://api.pushshift.io/reddit/search/comment/?q=approved&subreddit=DACA&after=365d&limit=100&sort=desc&sort_type=created_utc"
    ),
  ]);

  return responseArray;
};

export { requestData };
