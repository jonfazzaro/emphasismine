module.exports = function share(
  Tumblr: any,
  Twitter: any,
  Linkedin: any,
  MakerWebhooks: any,
  MASTODON_SERVER: string,
  MASTODON_TOKEN: string
) {
  const IN = "in";

  Twitter.postNewTweet.setTweet(tweet());
  shareToMastodon();
  if (isProfessional(Tumblr.newLinkPost.PostTags)) shareToLinkedIn();
  else Linkedin.shareLink.skip();

  function shareToMastodon() {
    post(`https://${MASTODON_SERVER}/api/v1/statuses`, {
      status: toot(),
    });
  }

  function post(url: string, body: any) {
    MakerWebhooks.makeWebRequest.setUrl(url);
    MakerWebhooks.makeWebRequest.setMethod("POST");
    MakerWebhooks.makeWebRequest.setContentType("application/json");
    MakerWebhooks.makeWebRequest.setAdditionalHeaders(
      `Authorization: Bearer ${MASTODON_TOKEN}`
    );
    MakerWebhooks.makeWebRequest.setBody(JSON.stringify(body));
  }

  function shareToLinkedIn() {
    Linkedin.shareLink.setLinkUrl(Tumblr.newLinkPost.LinkUrl);
    Linkedin.shareLink.setComment(linkedInComment());
  }

  function toot() {
    const tags = hash(Tumblr.newLinkPost.PostTags);
    const body = fixQuotes(stripHtml(stripHeader(Tumblr.newLinkPost.PostBodyHtml)));
    const link = Tumblr.newLinkPost.LinkUrl;

    return `${body}\n\n${link} ${tags}`.trim();
  }

  function tweet() {
    const tags = hash(Tumblr.newLinkPost.PostTags);
    const body = truncated(fixQuotes(stripHeader(Tumblr.newLinkPost.PostBodyHtml)), tags);
    const link = Tumblr.newLinkPost.LinkUrl;

    return `${body}\n\n${link} ${tags}`.trim();
  }

  function truncated(body: string, tags: string) {
    const overage = computeOverage(body, tags);
    if (body.length && overage > 0) return truncate(body, overage, `..."`);

    return body;
  }

  function truncate(value: string, by: number, cap: string) {
    return value.substring(0, value.length - (by + cap.length)) + cap;
  }

  function computeOverage(body: string, tags: string) {
    const TWITTER_LIMIT = 280;
    const TWITTER_LINK_LENGTH = 23; // per https://help.twitter.com/en/using-twitter/how-to-tweet-a-link
    const limit = TWITTER_LIMIT - TWITTER_LINK_LENGTH;
    const length = body.length + tags.length;
    return length - limit;
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

  function stripHtml(html: string) {
    return html.replace(/<\/?[^>]+(>|$)/g, "")
  }

  function fixQuotes(content: string) {
    return content
      .replace(/“/g, `"`)
      .replace(/”/g, `"`)
      .replace(/’/g, `'`)
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
