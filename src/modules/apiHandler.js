let requestData = async function requestData() {
  let responseArray = [];
  let renewalArray = [];
  let lastRenewalObject;
  let lastAdvancedParoleObject;
  //utilize flair to make sure no duplicates in array
  let getSubmission = async function (url, flair) {
    let response = await fetch(url, {
      mode: "cors",
    });
    response = await response.json();
    response = response.data.children;
    for (let submission of response) {
      if (submission.data.link_flair_text == flair) {
        submission.data.postedDate = new Date(1000 * submission.data.created_utc);
        responseArray.push(submission.data);
      }
      if (flair == "Application Timeline") {
        renewalArray.push(submission.data);
      }
    }
    if (flair == "Application Timeline") {
      lastRenewalObject = response[response.length - 1].data;
    }
    if (flair == "Advanced Parole") {
      lastAdvancedParoleObject = response[response.length - 1].data;
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
      "https://old.reddit.com/r/DACA/search/.json?sort=new&restrict_sr=on&q=flair%3AApplication%2BTimeline&limit=100",
      "Application Timeline"
    ),
    await getSubmission(
      "https://old.reddit.com/r/DACA/search/.json?sort=new&restrict_sr=on&q=flair%3AAdvanced%2BParole&limit=100",
      "Advanced Parole"
    ),

    await getComments(
      "https://api.pushshift.io/reddit/search/comment/?q=approved&subreddit=DACA&after=365d&limit=100&sort=desc&sort_type=created_utc"
    ),
  ]);

  while (renewalArray.length == 100) {
    renewalArray = [];
    let count = 100;
    let url =
      "https://old.reddit.com/r/DACA/search/.json?sort=new&restrict_sr=on&q=flair%3AApplication%2BTimeline&limit=100";
    let lastID = lastRenewalObject.id;
    let newURL = url + "&count=" + count + "&after=t3_" + lastID;
    count += 100;
    await getSubmission(newURL, "Application Timeline");
  }
  return responseArray;
};

export { requestData };
