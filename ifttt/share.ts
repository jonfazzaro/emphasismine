module.exports = function share(Tumblr: any, Twitter: any, Linkedin: any) {
  const IN = "in";
  Twitter.postNewTweet.setTweet(tweet());
  if (isProfessional(Tumblr.newLinkPost.PostTags)) shareToLinkedIn();
  else Linkedin.shareLink.skip();

  function shareToLinkedIn() {
    Linkedin.shareLink.setLinkUrl(Tumblr.newLinkPost.LinkUrl);
    Linkedin.shareLink.setComment(linkedInComment());
  }

  function tweet() {
    const body = stripHeader(Tumblr.newLinkPost.PostBodyHtml);
    const link = Tumblr.newLinkPost.LinkUrl;
    const tags = hash(Tumblr.newLinkPost.PostTags);

    return `${body}\n\n${link} ${tags}`.trim();
  }

  function linkedInComment() {
    const body = stripHeader(Tumblr.newLinkPost.PostBodyHtml);
    const tags = hash(Tumblr.newLinkPost.PostTags);

    return `${body}\n\n${tags}`.trim();
  }

  function stripHeader(body: string) {
    const P = "</p>";
    if (body.indexOf(P) === -1) return body;

    return body.split(P).slice(1).join("").trim();
  }

  function hash(tags: string) {
    if (!tags) return "";

    return tags
      .split(",")
      .filter(t => t != IN)
      .map(t => "#" + t.replace(/\s/g, ""))
      .join(" ");
  }

  function isProfessional(tags: string) {
    return !!tags.split(",").filter(t => t === IN).length;
  }
};
