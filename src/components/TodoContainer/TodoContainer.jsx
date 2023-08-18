import React, { useEffect, useState } from 'react';
import './todocontainer.css';
import {
  Card, TextInput, Textarea, Button,
  Modal,
  NativeSelect,
  LoadingOverlay,
  Notification,
  Alert,
} from '@mantine/core';
import axios from 'axios';
import { useDisclosure } from '@mantine/hooks';
import { useDispatch, useSelector } from 'react-redux';
import {
  MdHourglassBottom, MdDoneOutline, MdPostAdd,
} from 'react-icons/md';
import TodoCardList from '../TodoCardList/TodoCardList';
import { addAll, insertTodo } from '../store/todoSlice';

function TodoContainer() {
  const dispatch = useDispatch();
  const todoList = useSelector((state) => state.todo);
  const [opened, { open, close }] = useDisclosure(false);
  const getTodosApi = 'http://ec2-13-127-104-237.ap-south-1.compute.amazonaws.com:8080/todo/todos';
  const insertTodoApi = 'http://ec2-13-127-104-237.ap-south-1.compute.amazonaws.com:8080/todo/insertTodo';

  const [isLoading, setLoadingOverlay] = useState(false);
  const [insertOverlay, setInsertLoadingOverlay] = useState(false);
  const [title, setTodoTitle] = useState('');
  const [description, setTodoDescription] = useState('');
  const [status, setTodoStatus] = useState(0);
  const [showSuccessfulNotification, setSuccessfulNotification] = useState(false);
  const [showAlert, toggleAlert] = useState(false);
  const [alertMessage, updateAlertMessage] = useState('');

  useEffect(() => {
    setLoadingOverlay(true);
    axios.get(getTodosApi).then((response) => {
      dispatch(addAll(response.data));
      setLoadingOverlay(false);
    }).catch((error) => {
      setLoadingOverlay(false);
    });
  }, []);

  const dropDownData = [
    { value: 0, label: 'Not Started' },
    { value: 1, label: 'In progress' },
    { value: 2, label: 'Completed' },
  ];

  const cleanUp = () => {
    close();
    setTodoTitle('');
    setTodoDescription('');
    setTodoStatus(0);
    setLoadingOverlay(false);
    setInsertLoadingOverlay(false);
    setTimeout(() => { setSuccessfulNotification(false); }, 2000);
  };

  const isEmpty = (str) => (!str || str.length === 0);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isEmpty(title) || isEmpty(description)) {
      toggleAlert(true);
      updateAlertMessage('Title or description cannot be empty');
      setTimeout(() => { toggleAlert(false); }, 2000);
      return;
    }
    toggleAlert(false);
    const todo = {
      title,
      description,
      status,
      dttm: Date.now(),
    };
    setInsertLoadingOverlay(true);
    try {
      axios.post(insertTodoApi, todo)
        .then((response) => {
          setSuccessfulNotification(true);
          dispatch(insertTodo(response.data));
          cleanUp();
        });
    } catch (error) {
      console.log(error);
      setInsertLoadingOverlay(true);
      toggleAlert(true);
      updateAlertMessage('Title or description cannot be empty');
      setTimeout(() => { toggleAlert(false); }, 2000);
    }
  };

  return (
    <div className="todocontainer">
      <Modal opened={opened} onClose={cleanUp} className="inputmodal" title="Add Todo">
        <LoadingOverlay visible={insertOverlay} overlayBlur={2} />
        { showAlert && (
        <Alert title="Bummer!" color="red">
          {alertMessage}
        </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <div className="inputform">
            <TextInput
              placeholder="Todo Title"
              label="Title"
              value={title}
              onChange={(e) => setTodoTitle(e.target.value)}
            />
            <Textarea
              placeholder="Todo Description"
              label="Description"
              value={description}
              onChange={(e) => setTodoDescription(e.target.value)}
            />
            <NativeSelect
              data={dropDownData}
              label="Status"
              placeholder="Todo Status"
              onChange={(e) => setTodoStatus(e.target.value)}
            />
            <Button className="submitbutton" type="submit" size="xs">Submit</Button>
          </div>
        </form>
      </Modal>
      {' '}
      <Card shadow="sm" padding="lg" radius="md" withBorder className="todocardcontainer">
        <LoadingOverlay visible={isLoading} overlayBlur={2} />
        {showSuccessfulNotification && <Notification className="alertbanner" color="teal" withCloseButton={false} radius="md" title="Added succesfully" />}
        <div className="title">
          <h2>My Todo List</h2>
          <div className="iconmeaning">
            <div className="pending">
              <p>Pending:</p>
              <MdHourglassBottom className="statuspending" />
            </div>
            <div className="pending">
              <p>Compelted:</p>
              <MdDoneOutline className="statuscompleted" />
            </div>
            <div className="pending">
              <p>New:</p>
              <MdPostAdd className="statusToBeStarted" />
            </div>
          </div>
        </div>
        <Button onClick={open}>Add todo</Button>
        {todoList.length ? <TodoCardList todoList={todoList} />
          : (
            <div className="notasks">
              <p>There are no tasks currently, please add a few</p>
            </div>
          )}
      </Card>
    </div>
  );
}

export default TodoContainer;
