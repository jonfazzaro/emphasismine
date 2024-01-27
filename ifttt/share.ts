module.exports = function share(
    Tumblr: any,
    Twitter: any,
    Buffer: any,
    MakerWebhooks: any,
    Sms: any,
    MASTODON_SERVER: string,
    MASTODON_TOKEN: string,
    THREADS_TOKEN: string,
    DEBUG: boolean = false
) {
    const IN = "in";
    const inputPostTags = Tumblr.newLinkPost.PostTags;
    const inputPostBodyHtml = Tumblr.newLinkPost.PostBodyHtml;
    const inputLinkUrl = Tumblr.newLinkPost.LinkUrl;

    (function () {
            if (DEBUG) return debug();

            Sms.sendMeText.skip();
            Twitter.postNewTweet.setTweet(tweet());
            postToMastodon(toot())
            postToThreads(thread());
            if (isProfessional(inputPostTags)) shareToLinkedIn();
            else Buffer.addToBuffer.skip();

            function tweet() {
                const tags = hash(inputPostTags);
                return content(
                    truncated(clean(inputPostBodyHtml), tags),
                    inputLinkUrl,
                    tags
                );
            }

            function shareToLinkedIn() {
                Buffer.addToBuffer.setMessage(toot());
            }

            function thread() {
                return content(clean(inputPostBodyHtml), inputLinkUrl, "");
            }

            function toot() {
                return content(clean(inputPostBodyHtml), inputLinkUrl, hash(inputPostTags));
            }

            function postToThreads(content: string) {
                MakerWebhooks.makeWebRequest2.setUrl(`https://i.instagram.com/api/v1/media/configure_text_only_post/`);
                MakerWebhooks.makeWebRequest2.setMethod('POST');
                MakerWebhooks.makeWebRequest2.setContentType('application/x-www-form-urlencoded; charset=UTF-8');
                MakerWebhooks.makeWebRequest2.setAdditionalHeaders(
                    `authorization: Bearer IGT:2:${THREADS_TOKEN}\nuser-agent: Barcelona 289.0.0.77.109 Android\nsec-fetch-site: same-origin`
                );
                MakerWebhooks.makeWebRequest2.setBody('signed_body=SIGNATURE.' + JSON.stringify(
                    {
                        publish_mode: "text_post",
                        text_post_app_info: "{\"reply_control\":0}",
                        timezone_offset: "0",
                        source_type: "4",
                        _uid: "9945584",
                        device_id: "1o03hiy9f9280000",
                        caption: content,
                        device: {
                            manufacturer: "OnePlus",
                            model: "ONEPLUS+A3003",
                            android_version: 26,
                            android_release: "8.1.0"
                        }
                    }));
            }

            function postToMastodon(content: string) {
                MakerWebhooks.makeWebRequest1.setUrl(`https://${MASTODON_SERVER}/api/v1/statuses`);
                MakerWebhooks.makeWebRequest1.setMethod('POST');
                MakerWebhooks.makeWebRequest1.setContentType('application/json');
                MakerWebhooks.makeWebRequest1.setAdditionalHeaders(
                    `Authorization: Bearer ${MASTODON_TOKEN}`
                );
                MakerWebhooks.makeWebRequest1.setBody(JSON.stringify({
                    status: content,
                }));
            }

            function content(body: string, link: string, tags: string) {
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

            function clean(html: string) {
                return stripHtml(fixQuotes(stripHeader(html)));
            }

            function stripHeader(body: string) {
                const P = '</p>';
                if (body.indexOf(P) === -1) return body;

                return body.split(P).slice(1).join('').trim();
            }

            function stripHtml(html: string) {
                return html.replace(/<\/?[^>]+(>|$)/g, '');
            }

            function fixQuotes(content: string) {
                return content
                    .replace(/&ldquo;/g, `"`)
                    .replace(/&rdquo;/g, `"`)
                    .replace(/&rsquo;/g, `'`)
                    .replace(/&lsquo;/g, `'`);
            }

            function hash(tags: string) {
                if (!tags) return '';

                return tags
                    .split(',')
                    .filter((t) => t != IN)
                    .map((t) => '#' + t.replace(/\s/g, ''))
                    .join(' ');
            }

            function isProfessional(tags: string) {
                return !!tags.split(',').filter((t) => t === IN).length;
            }

            function debug() {
                Twitter.postNewTweet.skip();
                MakerWebhooks.makeWebRequest1.skip();
                MakerWebhooks.makeWebRequest2.skip();
                Buffer.addToBuffer.skip();
                Sms.sendMeText.setMessage(`Shared: ${toot()}`);
            }
        }
    ) ();

}
;
