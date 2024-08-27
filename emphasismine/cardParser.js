const hashtags = /(\s|\A)#(\w+)/g;
const hashtagsAtTheEnd = /(\s|\\)#(\w+)($|\s+#\w+)/g;
const httpLink = /\b(https?:\/\/[^\s/$.?#].\S*)\b/g
const markdownUrl = /\[([^\]]*)]\(((?<url>https?:\/\/[^)]+) ".*"\))/

function attachedUrl(card) {
    return card.attachments[0]?.url
        || urlFromDescription(card)
        || null;
}

function urlFromDescription(card) {
    return new RegExp(markdownUrl).test(card.desc)
        && card.desc.match(markdownUrl).groups.url
}

function description(card) {
    return desc(card)
        .replace(markdownUrl, "")
        .replace(httpLink, "").trim()
        .replace(hashtagsAtTheEnd, "")
        .replace(hashtags, " $2").trim()
}

function tags(card) {
    if (card.tags) return card.tags
    return [...desc(card).matchAll(hashtags)].map(m => m[2])
}

function desc(card) {
    return fixQuotes(unescapeHash(card.desc));
}

function unescapeHash(text) {
    return text.replace(/\\#/g, "#");
}

function fixQuotes(content) {
    return content
        .replace(/[\u201C\u201D]/g, '\"')
        .replace(/[\u2018\u2019]/g, '\'')
}

module.exports = {
    attachedUrl,
    urlFromDescription,
    description,
    tags,
    desc,
    unescapeHash,
    fixQuotes
};
