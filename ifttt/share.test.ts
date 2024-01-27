const share = require("./share");

describe("The share filter", () => {
    it("given nothing returns nothing", () => {
        post("", "", "");
        expectToot("");
        expectTweet("");
        expectThread("");
        expectNoLinkedInPost();
        expectNoSmsMessage();
    });

    it("removes the top of the link post", () => {
        post(
            `<p>Scrum's unintended and gradual disconnect from Product Management</p>\n<p>&ldquo;Unfortunately, the Scrum community seems unwilling to inspect and adapt. It clings to a Product Owner ideal that is rarely used in practice and doesn&rsquo;t scale. It&lsquo;s easier to point fingers and claim that people with PM/PO solutions or multiple POs per product are not doing Scrum.&rdquo;</p>\n\n`,
            "https://www.amazon.com",
            "buy buy,get back"
        );
        expectTweet(`"Unfortunately, the Scrum community seems unwilling to inspect and adapt. It clings to a Product Owner ideal that is rarely used in practice and doesn't scale. It's easier to point fingers and claim that people with PM/PO solutions or mu..."\n\nhttps://www.amazon.com #buybuy #getback`);
        expectToot(`"Unfortunately, the Scrum community seems unwilling to inspect and adapt. It clings to a Product Owner ideal that is rarely used in practice and doesn't scale. It's easier to point fingers and claim that people with PM/PO solutions or multiple POs per product are not doing Scrum."\n\nhttps://www.amazon.com #buybuy #getback`);
        expectThread(`"Unfortunately, the Scrum community seems unwilling to inspect and adapt. It clings to a Product Owner ideal that is rarely used in practice and doesn't scale. It's easier to point fingers and claim that people with PM/PO solutions or multiple POs per product are not doing Scrum."\n\nhttps://www.amazon.com`);
        expectNoLinkedInPost();
        expectNoSmsMessage();
    });

    describe("given a professional signal tag", () => {
        it("posts to LinkedIn, too", () => {
            post(
                `"Just what do you think you are you doing, Dave?"`,
                "https://www.hal9000.net/daisy",
                "agility,in,horse feathers"
            );

            expectToot(`"Just what do you think you are you doing, Dave?"\n\nhttps://www.hal9000.net/daisy #agility #horsefeathers`);
            expectTweet(`"Just what do you think you are you doing, Dave?"\n\nhttps://www.hal9000.net/daisy #agility #horsefeathers`);
            expectThread(`"Just what do you think you are you doing, Dave?"\n\nhttps://www.hal9000.net/daisy`);
            expectLinkedInPost(`"Just what do you think you are you doing, Dave?"\n\nhttps://www.hal9000.net/daisy #agility #horsefeathers`);
            expectNoSmsMessage();
        });
    });

    describe('given this post HTML', () => {
        it('should post to LinkedIn', () => {
            const HTML = `<p class="npf_link" data-npf='{"type":"link","url":"https://stackoverflow.blog/2023/02/13/coding-102-writing-code-other-people-can-read/","display_url":"https://stackoverflow.blog/2023/02/13/coding-102-writing-code-other-people-can-read/","title":"Coding 102: Writing code other people can read","poster":[{"media_key":"a4446df772d8a5a54a918af0f66d6085:a98981dbd19f9ffe-23","type":"image/jpeg","width":2560,"height":1344}]}'><a href="https://stackoverflow.blog/2023/02/13/coding-102-writing-code-other-people-can-read/" target="_blank">Coding 102: Writing code other people can read</a></p><p>"It took me two hours to code the script, but eight hours to undo the damage it caused and fix my convoluted code. That&rsquo;s the maintenance cost."</p>`
            const url = "https://stackoverflow.blog/2023/02/13/coding-102-writing-code-other-people-can-read/";
            post(
                HTML,
                url,
                "in,code,quality,cost"
            );
            expectLinkedInPost(
                `"It took me two hours to code the script, but eight hours to undo the damage it caused and fix my convoluted code. That's the maintenance cost."\n\n${url} #code #quality #cost`
            );
        });
    });

    describe('when debugging', () => {
        const HTML = `<p class="npf_link" data-npf='{"type":"link","url":"https://cabel.com/2023/02/25/the-courtyard/","display_url":"https://cabel.com/2023/02/25/the-courtyard/","title":"The Courtyard","description":"There was a time when apartment buildings were built with large, spacious courtyards. The idea is so obvious: it&rsquo;s not comfortable or natural to live in a packed block of living units. Breath&hellip;","poster":[{"media_key":"197192bdb19ab070cd8e67dd171e02ce:80ba8e5b152836bd-c6","type":"image/jpeg","width":1200,"height":900}]}'><a href="https://cabel.com/2023/02/25/the-courtyard/" target="_blank">The Courtyard</a></p><p>"Whatever you're working on right now, whatever it might be, I ask: try to leave a little space for a courtyard."</p>`
        const url = "https://seths.blog/2023/02/checking-the-date/";

        beforeEach(() => {
            Sms.sendMeText.skip.mockClear();
            debugPost(HTML, url, "in,test")
        })

        it('should not post anywhere', function () {
            expect(Twitter.postNewTweet.skip).toHaveBeenCalled();
            expect(MakerWebhooks.makeWebRequest1.skip).toHaveBeenCalled();
            expect(MakerWebhooks.makeWebRequest2.skip).toHaveBeenCalled();
            expect(Buffer_.addToBuffer.skip).toHaveBeenCalled();
        });

        it('should send SMS messages', function () {
            expect(Sms.sendMeText.skip).not.toHaveBeenCalled()
        });

        it('should SMS the Toot', function () {
            expect(Sms.sendMeText.setMessage).toHaveBeenCalledWith(`Shared: "Whatever you're working on right now, whatever it might be, I ask: try to leave a little space for a courtyard."\n\n${url} #test`)
        });

    });
});

const MakerWebhooks = {
    makeWebRequest1: {
        setUrl: jest.fn(),
        setMethod: jest.fn(),
        setContentType: jest.fn(),
        setAdditionalHeaders: jest.fn(),
        setBody: jest.fn(),
        skip: jest.fn()
    },
    makeWebRequest2: {
        setUrl: jest.fn(),
        setMethod: jest.fn(),
        setContentType: jest.fn(),
        setAdditionalHeaders: jest.fn(),
        setBody: jest.fn(),
        skip: jest.fn()
    }
}
const Twitter = {
    postNewTweet: {
        setTweet: jest.fn(),
        skip: jest.fn()
    }
};
const Buffer_ = {
    addToBuffer: {
        setMessage: jest.fn(),
        skip: jest.fn(),
    },
};
const Sms = {
    sendMeText: {
        skip: jest.fn(),
        setMessage: jest.fn()
    }
}

function expectLinkedInPost(content: string) {
    expect(Buffer_.addToBuffer.setMessage).toHaveBeenCalledWith(content);
}

function post(body: string, url: string, tags: string) {
    share(
        tumblr({body, url, tags}),
        Twitter, Buffer_, MakerWebhooks, Sms,
        "hachyderm.io",
        "t00ts",
        "zuckU",
        );
}

function debugPost(body: string, url: string, tags: string) {
    share(
        tumblr({body, url, tags}),
        Twitter, Buffer_, MakerWebhooks, Sms,
        "hachyderm.io",
        "t00ts",
        "zuckU",
        true);
}

function expectToot(toot) {
    expect(MakerWebhooks.makeWebRequest1.setUrl).toHaveBeenCalledWith("https://hachyderm.io/api/v1/statuses");
    expect(MakerWebhooks.makeWebRequest1.setMethod).toHaveBeenCalledWith("POST");
    expect(MakerWebhooks.makeWebRequest1.setContentType).toHaveBeenCalledWith("application/json");
    expect(MakerWebhooks.makeWebRequest1.setAdditionalHeaders).toHaveBeenCalledWith("Authorization: Bearer t00ts");
    expect(MakerWebhooks.makeWebRequest1.setBody).toHaveBeenCalledWith(JSON.stringify({status: toot}));
    expect(MakerWebhooks.makeWebRequest1.skip).not.toHaveBeenCalled()
}

function expectThread(thread) {
    expect(MakerWebhooks.makeWebRequest2.setUrl).toHaveBeenCalledWith("https://i.instagram.com/api/v1/media/configure_text_only_post/");
    expect(MakerWebhooks.makeWebRequest2.setMethod).toHaveBeenCalledWith("POST");
    expect(MakerWebhooks.makeWebRequest2.setContentType).toHaveBeenCalledWith("application/x-www-form-urlencoded; charset=UTF-8");
    expect(MakerWebhooks.makeWebRequest2.setAdditionalHeaders)
        .toHaveBeenCalledWith("authorization: Bearer IGT:2:zuckU\nuser-agent: Barcelona 289.0.0.77.109 Android\nsec-fetch-site: same-origin");
    expect(MakerWebhooks.makeWebRequest2.setBody).toHaveBeenCalledWith('signed_body=SIGNATURE.' + JSON.stringify( {
        "publish_mode": "text_post",
        "text_post_app_info": "{\"reply_control\":0}",
        "timezone_offset": "0",
        "source_type": "4",
        "_uid": "9945584",
        "device_id": "1o03hiy9f9280000",
        "caption": thread,
        "device": {
            "manufacturer": "OnePlus",
            "model": "ONEPLUS+A3003",
            "android_version": 26,
            "android_release": "8.1.0"
        }
    }));
    expect(MakerWebhooks.makeWebRequest2.skip).not.toHaveBeenCalled()
}

function expectTweet(tweet) {
    expect(Twitter.postNewTweet.setTweet).toHaveBeenCalledWith(tweet);
    expect(Twitter.postNewTweet.skip).not.toHaveBeenCalled()
}

function expectNoLinkedInPost() {
    expect(Buffer_.addToBuffer.skip).toHaveBeenCalled();
    expect(Buffer_.addToBuffer.setMessage).not.toHaveBeenCalled();
}

function expectNoSmsMessage() {
    expect(Sms.sendMeText.skip).toHaveBeenCalled();
}

function tumblr({body, url, tags}) {
    return {
        newLinkPost: {
            PostBodyHtml: body,
            LinkUrl: url,
            PostTags: tags,
        },
    };
}
