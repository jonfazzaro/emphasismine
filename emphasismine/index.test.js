const trello = require('./trello');
const subject = require("./index");

describe("The emphasis mine function", () => {
  it("is under test", () => {
    subject(_mocked.context, _mocked.timer);
    expect(_mocked.context.log).toHaveBeenCalled();
  });

  describe('given no cards in the list', () => {
      it('does not post anything', () => {

        
          
      });
      
  });
});

jest.mock('./trello');

const _mocked = {
  context: {
    log: jest.fn(),
  },
  timer: { isPastDue: false },
};
