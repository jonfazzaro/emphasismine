module.exports = function share(Tumblr:any, Twitter:any) {
  Twitter.postNewTweet.setTweet(content());

  function content() {
    const body = stripHeader(Tumblr.newLinkPost.PostBodyHtml);
    const link = Tumblr.newLinkPost.LinkUrl;
    const tags = hash(Tumblr.newLinkPost.PostTags);

    return `${body}\n\n${link} ${tags}`.trim();
  }

  function stripHeader(body: string) {
    const P = "</p>";
    if (body.indexOf(P) === -1)
      return body;

    return body.split(P).slice(1).join("").trim();
  }

  function hash(tags: string) {
    if (!tags) return "";

    return tags
      .split(",")
      .map(t => "#" + t.replace(/\s/g, ""))
      .join(" ");
  }
};
