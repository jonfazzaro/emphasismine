const share = require("./share");

describe("The share filter", () => {
  it("given nothing returns nothing", () => {
    post("", "", "");
    expect(Twitter.postNewTweet.setTweet).toHaveBeenCalledWith("");
  });

  it("removes the top of the link post", () => {
    post(
      `<p>Scrum's unintended and gradual disconnect from Product Management</p>\n"Unfortunately, the Scrum community seems unwilling to inspect and adapt. It clings to a Product Owner ideal that is rarely used in practice and doesn’t scale. It’s easier to point fingers and claim that people with PM/PO solutions or multiple POs per product are not doing Scrum."\n\n`,
      "https://www.amazon.com",
      "buy buy,emphasismine,get back"
    );
    expect(Twitter.postNewTweet.setTweet).toHaveBeenCalledWith(
      `"Unfortunately, the Scrum community seems unwilling to inspect and adapt. It clings to a Product Owner ideal that is rarely used in practice and doesn’t scale. It’s easier to point fingers and claim that people with PM/PO solutions or multiple POs per product are not doing Scrum."\n\nhttps://www.amazon.com #buybuy #emphasismine #getback`
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
