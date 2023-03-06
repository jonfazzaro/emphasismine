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
      `<p>Scrum's unintended and gradual disconnect from Product Management</p>\n&ldquo;Unfortunately, the Scrum community seems unwilling to inspect and adapt. It clings to a Product Owner ideal that is rarely used in practice and doesn&rsquo;t scale. It&lsquo;s easier to point fingers and claim that people with PM/PO solutions or multiple POs per product are not doing Scrum.&rdquo;\n\n`,
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

  describe('given this post HTML', () => {
    it('should post to LinkedIn', () => {
      const HTML = `<p class="npf_link" data-npf='{"type":"link","url":"https://stackoverflow.blog/2023/02/13/coding-102-writing-code-other-people-can-read/","display_url":"https://stackoverflow.blog/2023/02/13/coding-102-writing-code-other-people-can-read/","title":"Coding 102: Writing code other people can read","poster":[{"media_key":"a4446df772d8a5a54a918af0f66d6085:a98981dbd19f9ffe-23","type":"image/jpeg","width":2560,"height":1344}]}'><a href="https://stackoverflow.blog/2023/02/13/coding-102-writing-code-other-people-can-read/" target="_blank">Coding 102: Writing code other people can read</a></p><p>"It took me two hours to code the script, but eight hours to undo the damage it caused and fix my convoluted code. That&rsquo;s the maintenance cost."</p>`
      let url = "https://stackoverflow.blog/2023/02/13/coding-102-writing-code-other-people-can-read/";
      post(
          HTML,
          url,
          "in,code,quality,cost"
      );
      expectLinkedInPost(
          url,
          `"It took me two hours to code the script, but eight hours to undo the damage it caused and fix my convoluted code. That's the maintenance cost."\n\n#code #quality #cost`
      );
    });
  });

  describe('given some other post HTML', () => {

    it('should post like this to LinkedIn', () => {
      const HTML = `<p class="npf_link" data-npf='{"type":"link","url":"https://seths.blog/2023/02/checking-the-date/","display_url":"https://seths.blog/2023/02/checking-the-date/","title":"Checking the date","poster":[{"media_key":"60e6468e3fbe6b6e0345f1542ab661af:45eb4eb6fd1ff38a-d0","type":"image/jpeg","width":1200,"height":628}]}'><a href="https://seths.blog/2023/02/checking-the-date/" target="_blank">Checking the date</a></p><p>"Every day is April Fools from now on."</p>`
      let url = "https://seths.blog/2023/02/checking-the-date/";
      post(
          HTML,
          url,
          "in,ai"
      );
      expectLinkedInPost(
          url,
          `"Every day is April Fools from now on."\n\n#ai`
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
