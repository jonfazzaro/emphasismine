module.exports = function share(Tumblr:any, Twitter:any) {
  Twitter.postNewTweet.setTweet(content());

  function content() {
    const body = main(Tumblr.newLinkPost.PostBodyHtml);
    const link = Tumblr.newLinkPost.LinkUrl;
    const tags = hash(Tumblr.newLinkPost.PostTags);

    return `${body}\n\n${link} ${tags}`.trim();
  }

  function main(body: string) {
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

  function unwrap(url: string) {
    return parseQuery(url.split("?")[1]).z;
  }

  function parseQuery(queryString: string) {
    var query: any = {};
    var pairs = (
      queryString[0] === "?" ? queryString.substr(1) : queryString
    ).split("&");
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split("=");
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
    }
    return query;
  }
};
