const mastodon = require('./mastodon')

describe('The Mastodon poster', () => {

    it('renders a status with no tags', () => {
        const post = mastodon.status(card)

        expect(post).toEqual(`"I just like making music. I don't want to sound pretentious, but it's how I grab magic out of the boring air around me. I think that's my vice."\n` +
            '\n' +
            'https://www.npr.org/2024/08/15/nx-s1-5072600/louis-cole-new-album-choir-orchestra'
        )
    });

    it('renders a status with tags', () => {
        const post = mastodon.status({...card, tags: 'in,knower,effitup'})

        expect(post).toEqual(`"I just like making music. I don't want to sound pretentious, but it's how I grab magic out of the boring air around me. I think that's my vice."\n` +
            '\n' +
            '#knower #effitup\n' +
            '\n' +
            'https://www.npr.org/2024/08/15/nx-s1-5072600/louis-cole-new-album-choir-orchestra'
        )
    });

});

const card = {
    link: 'https://www.npr.org/2024/08/15/nx-s1-5072600/louis-cole-new-album-choir-orchestra',
    text: `"I just like making music. I don't want to sound pretentious, but it's how I grab magic out of the boring air around me. I think that's my vice."`,
    tags: ''
};
