const share = require("./share");

describe("The share filter", () => {
  it("given nothing returns nothing", () => {
    post("", "", "");
    expectTweet("");
    expectNoLinkedInPost();
  });

  it("removes the top of the link post", () => {
    post(
      `<p>Scrum's unintended and gradual disconnect from Product Management</p>\n"Unfortunately, the Scrum community seems unwilling to inspect and adapt. It clings to a Product Owner ideal that is rarely used in practice and doesn’t scale. It’s easier to point fingers and claim that people with PM/PO solutions or multiple POs per product are not doing Scrum."\n\n`,
      "https://www.amazon.com",
      "buy buy,emphasismine,get back"
    );
    expectTweet(
      `"Unfortunately, the Scrum community seems unwilling to inspect and adapt. It clings to a Product Owner ideal that is rarely used in practice and doesn’t scale. It’s easier to point fingers and claim that people with PM/PO s..."\n\nhttps://www.amazon.com #buybuy #emphasismine #getback`
    );
    expectNoLinkedInPost();
  });

  describe("given a professional signal tag", () => {
    it("posts to LinkedIn, too", () => {
      post(
        `"Just what do you think you are you doing, Dave?"`,
        "https://www.hal9000.net/daisy",
        "agility,in,horse feathers"
      );

      expectTweet(
        `"Just what do you think you are you doing, Dave?"\n\nhttps://www.hal9000.net/daisy #agility #horsefeathers`
      );
      expectLinkedInPost(
        "https://www.hal9000.net/daisy",
        `"Just what do you think you are you doing, Dave?"\n\n#agility #horsefeathers`
      );
    });
  });
});

const Twitter = { postNewTweet: { setTweet: jest.fn() } };
const Linkedin = {
  shareLink: {
    setLinkUrl: jest.fn(),
    setComment: jest.fn(),
    skip: jest.fn(),
  },
};

function expectLinkedInPost(link: string, comment: string) {
  expect(Linkedin.shareLink.setLinkUrl).toHaveBeenCalledWith(link);
  expect(Linkedin.shareLink.setComment).toHaveBeenCalledWith(comment);
}

function post(body: string, url: string, tags: string) {
  share(tumblr({ body, url, tags }), Twitter, Linkedin);
}

function expectTweet(tweet) {
  expect(Twitter.postNewTweet.setTweet).toHaveBeenCalledWith(tweet);
}

function expectNoLinkedInPost() {
  expect(Linkedin.shareLink.skip).toHaveBeenCalled();
  expect(Linkedin.shareLink.setLinkUrl).not.toHaveBeenCalled();
  expect(Linkedin.shareLink.setComment).not.toHaveBeenCalled();
}

function tumblr({ body, url, tags }) {
  return {
    newLinkPost: {
      PostBodyHtml: body,
      LinkUrl: url,
      PostTags: tags,
    },
  };
}
