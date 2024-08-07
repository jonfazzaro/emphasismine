const share = require("./share");

describe("The share filter", () => {
    it("given nothing returns nothing", () => {
        post("", "", "");
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
            expect(Buffer_.addToBuffer1.skip).toHaveBeenCalled();
            expect(Buffer_.addToBuffer2.skip).toHaveBeenCalled();
            expect(Buffer_.addToBuffer3.skip).toHaveBeenCalled();
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
    makeWebRequest: {
        setUrl: jest.fn(),
        setMethod: jest.fn(),
        setContentType: jest.fn(),
        setAdditionalHeaders: jest.fn(),
        setBody: jest.fn(),
        skip: jest.fn()
    },
    jsonEvent: {
        JsonPayload: "{}"
    }
}
const Twitter = {
    postNewTweet: {
        setTweet: jest.fn(),
        skip: jest.fn()
    }
};
const Buffer_ = {
    addToBuffer1: {
        setMessage: jest.fn(),
        skip: jest.fn(),
    },
    addToBuffer2: {
        setMessage: jest.fn(),
        skip: jest.fn(),
    },
    addToBuffer3: {
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
    expect(Buffer_.addToBuffer1.setMessage).toHaveBeenCalledWith(content);
}

function post(text: string, link: string, tags: string) {
    input({text, link, tags})
    share(
        Buffer_, MakerWebhooks, Sms,
        "zuckU");
}

function debugPost(text: string, link: string, tags: string) {
    input({text, link, tags, debug: true})
    share(
        Buffer_, MakerWebhooks, Sms,
        "zuckU");
}

function expectToot(toot) {
    expect(Buffer_.addToBuffer3.setMessage).toHaveBeenCalledWith(toot);
    expect(Buffer_.addToBuffer3.skip).not.toHaveBeenCalled()
}

function expectThread(thread) {
    expect(Buffer_.addToBuffer3.setMessage).toHaveBeenCalledWith(thread);
    expect(Buffer_.addToBuffer3.skip).not.toHaveBeenCalled()
}

function expectTweet(tweet) {
    expect(Buffer_.addToBuffer2.setMessage).toHaveBeenCalledWith(tweet);
    expect(Buffer_.addToBuffer2.skip).not.toHaveBeenCalled()
}

function expectNoLinkedInPost() {
    expect(Buffer_.addToBuffer1.skip).toHaveBeenCalled();
    expect(Buffer_.addToBuffer1.setMessage).not.toHaveBeenCalled();
}

function expectNoSmsMessage() {
    expect(Sms.sendMeText.skip).toHaveBeenCalled();
}

function input(data) {
    MakerWebhooks.jsonEvent = {
        JsonPayload: JSON.stringify(data)
    };
}
