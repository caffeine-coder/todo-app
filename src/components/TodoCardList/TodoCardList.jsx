import React from 'react';
import PropTypes from 'prop-types';
import TodoCard from '../TodoCard/TodoCard';

function TodoCardList(props) {
  TodoCardList.propTypes = {
    todoList: PropTypes.instanceOf(Object).isRequired,
  };
  const { todoList } = props;
  return (
    <div className="todocardlist">
      {todoList.map((todo) => <TodoCard todo={todo} key={todo.id} />)}
    </div>
  );
}

export default TodoCardList;
