'use strict';

const e = React.createElement;

class TaskList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    if (this.state.liked) {
      return 'You liked this.';
    }

    return e(
      'p', { }, 
      'This is a react component'
    );
  }
}


ReactDOM.render(
  e(TaskList),
  document.getElementById('react-com')
);