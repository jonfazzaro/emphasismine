const share = require("./share");

describe("The share filter", () => {
  it("given nothing returns nothing", () => {
    post("", "", "");
    expectToot("");
    expectTweet("");
    expectNoLinkedInPost();
  });

  it("removes the top of the link post", () => {
    post(
      `<p>Scrum's unintended and gradual disconnect from Product Management</p>\n“Unfortunately, the Scrum community seems unwilling to inspect and adapt. It clings to a Product Owner ideal that is rarely used in practice and doesn’t scale. It’s easier to point fingers and claim that people with PM/PO solutions or multiple POs per product are not doing Scrum.”\n\n`,
      "https://www.amazon.com",
      "buy buy,get back"
    );
    expectTweet(`"Unfortunately, the Scrum community seems unwilling to inspect and adapt. It clings to a Product Owner ideal that is rarely used in practice and doesn't scale. It's easier to point fingers and claim that people with PM/PO solutions or mu..."\n\nhttps://www.amazon.com #buybuy #getback`);
    expectToot(`"Unfortunately, the Scrum community seems unwilling to inspect and adapt. It clings to a Product Owner ideal that is rarely used in practice and doesn't scale. It's easier to point fingers and claim that people with PM/PO solutions or multiple POs per product are not doing Scrum."\n\nhttps://www.amazon.com #buybuy #getback`);
    expectNoLinkedInPost();
  });

  describe("given a professional signal tag", () => {
    it("posts to LinkedIn, too", () => {
      post(
        `"Just what do you think you are you doing, Dave?"`,
        "https://www.hal9000.net/daisy",
        "agility,in,horse feathers"
      );

      expectToot( `"Just what do you think you are you doing, Dave?"\n\nhttps://www.hal9000.net/daisy #agility #horsefeathers`);
      expectTweet( `"Just what do you think you are you doing, Dave?"\n\nhttps://www.hal9000.net/daisy #agility #horsefeathers`);
      expectLinkedInPost(
        "https://www.hal9000.net/daisy",
        `"Just what do you think you are you doing, Dave?"\n\n#agility #horsefeathers`
      );
    });
  });
});

const MakerWebhooks = { 
  makeWebRequest: {
    setUrl: jest.fn(),
    setMethod: jest.fn(),
    setContentType: jest.fn(),
    setAdditionalHeaders: jest.fn(),
    setBody: jest.fn(),
  }
}
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
  share(tumblr({ body, url, tags }), Twitter, Linkedin, MakerWebhooks, "hachyderm.io", "t00ts");
}

function expectToot(toot) {
  expect(MakerWebhooks.makeWebRequest.setUrl).toHaveBeenCalledWith("https://hachyderm.io/api/v1/statuses");
  expect(MakerWebhooks.makeWebRequest.setMethod).toHaveBeenCalledWith("POST");
  expect(MakerWebhooks.makeWebRequest.setContentType).toHaveBeenCalledWith("application/json");
  expect(MakerWebhooks.makeWebRequest.setAdditionalHeaders).toHaveBeenCalledWith("Authorization: Bearer t00ts");
  expect(MakerWebhooks.makeWebRequest.setBody) .toHaveBeenCalledWith(JSON.stringify({ status: toot }));
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
