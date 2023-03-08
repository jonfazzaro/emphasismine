module.exports = function share(
    Tumblr: any,
    Twitter: any,
    Linkedin: any,
    MakerWebhooks: any,
    Sms: any,
    MASTODON_SERVER: string,
    MASTODON_TOKEN: string,
    DEBUG: boolean = false
) {
    const IN = "in";
    const inputPostTags = Tumblr.newLinkPost.PostTags;
    const inputPostBodyHtml = Tumblr.newLinkPost.PostBodyHtml;
    const inputLinkUrl = Tumblr.newLinkPost.LinkUrl;

    (function () {
        if (DEBUG)
            return debug();

        Sms.sendMeText.skip();
        Twitter.postNewTweet.setTweet(tweet());
        shareToMastodon();
        if (isProfessional(inputPostTags)) shareToLinkedIn();
        else Linkedin.shareLink.skip();

        function tweet() {
            const tags = hash(inputPostTags);
            return content(
                truncated(clean(inputPostBodyHtml), tags),
                inputLinkUrl,
                tags);
        }

        function shareToMastodon() {
            post(`https://${MASTODON_SERVER}/api/v1/statuses`, {
                status: toot(),
            });
        }

        function shareToLinkedIn() {
            Linkedin.shareLink.setLinkUrl(inputLinkUrl);
            Linkedin.shareLink.setComment(linkedInComment());
        }

        function toot() {
            return content(
                clean(inputPostBodyHtml),
                inputLinkUrl,
                hash(inputPostTags));
        }

        function linkedInComment() {
            return comment(
                clean(inputPostBodyHtml),
                hash(inputPostTags));
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

        function content(body: string, link: string, tags: string) {
            return `${body}\n\n${link} ${tags}`.trim();
        }

        function comment(body: string, tags: string) {
            return `${body}\n\n${tags}`.trim();
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

        function clean(html: string) {
            return stripHtml(fixQuotes(stripHeader(html)));
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
                .replace(/&ldquo;/g, `"`)
                .replace(/&rdquo;/g, `"`)
                .replace(/&rsquo;/g, `'`)
                .replace(/&lsquo;/g, `'`)
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

        function debug() {
            Twitter.postNewTweet.skip();
            MakerWebhooks.makeWebRequest.skip();
            Linkedin.shareLink.skip();
            Sms.sendMeText.setMessage(`Tweet: ${tweet()}`);
            Sms.sendMeText.setMessage(`Toot: ${toot()}`);
            Sms.sendMeText.setMessage(`LinkedIn: ${linkedInComment()}`);
        }

    }());
};
