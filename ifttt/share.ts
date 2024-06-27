module.exports = function share(
    Buffer: any,
    MakerWebhooks: any,
    Sms: any,
) {
    (function () {
            const IN = "in";
            const input = JSON.parse(MakerWebhooks.jsonEvent.JsonPayload)

            if (input.debug) return debug();

            Sms.sendMeText.skip();
            Buffer.addToBuffer2.setMessage(tweet());
            shareToThreads(thread());
            if (isProfessional(input.tags)) shareToLinkedIn();
            else Buffer.addToBuffer1.skip();

            function tweet() {
                const tags = hash(input.tags);
                return content(
                    truncated(clean(input.text), tags),
                    input.link,
                    tags
                );
            }

            function shareToLinkedIn() {
                Buffer.addToBuffer1.setMessage(toot());
            }

            function thread() {
                return content(clean(input.text), input.link, "");
            }

            function toot() {
                return content(clean(input.text), input.link, hash(input.tags));
            }

            function shareToThreads(content: string) {
                Buffer.addToBuffer4.setMessage(content)
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
                Buffer.addToBuffer1.skip();
                Buffer.addToBuffer2.skip();
                Buffer.addToBuffer4.skip();
                Sms.sendMeText.setMessage(`Shared: ${toot()}`);
            }
        }
    )();
};
