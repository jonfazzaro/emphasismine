const share = require("./share");

describe("The share filter", () => {
  it("given nothing returns nothing", () => {
    post("", "", "");
    expect(Twitter.postNewTweet.setTweet).toHaveBeenCalledWith("");
  });

  it("removes the top of the link post", () => {
    post(
      `\nbuy\n\nthings`,
      "https://www.amazon.com",
      "buy buy,emphasismine,get back"
    );
    expect(Twitter.postNewTweet.setTweet).toHaveBeenCalledWith(
      `buy\n\nthings\n\nhttps://www.amazon.com #buybuy #emphasismine #getback`
    );
  });
});

const Twitter = { postNewTweet: { setTweet: jest.fn() } };

function post(body: string, url: string, tags: string) {
  share(tumblr({ body, url, tags }), Twitter);
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
