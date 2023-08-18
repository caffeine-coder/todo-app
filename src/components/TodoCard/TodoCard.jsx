import React, { useState } from 'react';
import {
  Text, Paper, Tooltip, Modal, TextInput, Textarea, Button, NativeSelect, Notification,
  Group, Alert, LoadingOverlay,
} from '@mantine/core';
import PropTypes from 'prop-types';
import './todocard.css';
import {
  MdOutlineDeleteOutline, MdHourglassBottom, MdDoneOutline, MdPostAdd, MdOutlineEdit,
} from 'react-icons/md';
import axios from 'axios';
import { useDisclosure } from '@mantine/hooks';
import { useDispatch } from 'react-redux';
import { updateTodo, remove } from '../store/todoSlice';

function TodoCard(props) {
  TodoCard.propTypes = {
    todo: PropTypes.instanceOf(Object).isRequired,
  };
  const { todo } = props;
  const dispatch = useDispatch();
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [title, setTodoTitle] = useState(todo.title);
  const [description, setTodoDescription] = useState(todo.description);
  const [tododttm, setTodoDttm] = useState(todo.dttm);
  const [todoStatus, setTodoStatus] = useState(todo.status);
  const [todoId, setTodoId] = useState(todo.id);
  const [showSuccessfulNotification, setSuccessfulNotification] = useState(false);
  const [isLoading, setLoadingOverlay] = useState(false);
  const [deleteOverlay, setDeleteLoadingOverlay] = useState(false);
  const [showAlert, toggleAlert] = useState(false);
  const [alertMessage, updateAlertMessage] = useState('');
  const updateTodoApi = 'http://ec2-13-127-104-237.ap-south-1.compute.amazonaws.com:8080/todo/updateTodo';
  const statusPending = <MdHourglassBottom className="statuspending" />;
  const statusCompleted = <MdDoneOutline className="statuscompleted" />;
  const statusToBeStarted = <MdPostAdd className="statusnew" />;
  let status;
  let statusToolTip;
  const date = new Date(tododttm);

  switch (todo.status) {
    case 0:
      status = statusToBeStarted;
      statusToolTip = 'To be started';
      break;
    case 1:
      status = statusPending;
      statusToolTip = 'In Progress';
      break;
    case 2:
      status = statusCompleted;
      statusToolTip = 'Completed';
      break;
    default:
      status = statusToBeStarted;
      statusToolTip = 'To be started';
  }

  const dropDownData = [
    { value: 0, label: 'Not Started' },
    { value: 1, label: 'In progress' },
    { value: 2, label: 'Completed' },
  ];

  const toggleDeleteDialog = () => {
    setDeleteDialog(!deleteDialog);
  };

  const isEmpty = (str) => (!str || str.length === 0);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isEmpty(title) || isEmpty(description)) {
      toggleAlert(true);
      updateAlertMessage('Title or description cannot be empty');
      setTimeout(() => { toggleAlert(false); }, 3000);
      return;
    }
    if (title === todo.title && description === todo.description && todoStatus === todo.status) {
      toggleAlert(true);
      updateAlertMessage('Please make some changes to update');
      setTimeout(() => { toggleAlert(false); }, 3000);
      return;
    }
    const updatedTodo = {
      title,
      description,
      status: todoStatus,
      id: todoId,
      dttm: Date.now(),
    };
    try {
      setLoadingOverlay(true);
      axios.post(updateTodoApi, updatedTodo)
        .then((response) => {
          setSuccessfulNotification(true);
          dispatch(updateTodo(response.data));
          setTodoId(response.data.id);
          setTodoTitle(response.data.title);
          setTodoStatus(response.data.status);
          setTodoDescription(response.data.description);
          setTodoDttm(response.data.dttm);
          setLoadingOverlay(false);
          setTimeout(() => { setSuccessfulNotification(false); }, 2000);
        });
    } catch (error) {
      console.log(error);
      toggleAlert(true);
      updateAlertMessage('Something went wrong, please try again');
      setLoadingOverlay(true);
      setTimeout(() => { toggleAlert(false); }, 3000);
    }
  };

  const handleDeleteClick = () => {
    const deltedId = todoId;
    setDeleteLoadingOverlay(true);
    try {
      axios.delete(`http://ec2-13-127-104-237.ap-south-1.compute.amazonaws.com:8080/todo/delete/${todoId}`)
        .then((response) => {
          setDeleteLoadingOverlay(false);
          toggleDeleteDialog();
          dispatch(remove(deltedId));
        });
    } catch (error) {
      console.log(error);
      toggleAlert(true);
      updateAlertMessage('Something went wrong, please try again');
      setTimeout(() => { toggleAlert(false); }, 3000);
      setDeleteLoadingOverlay(false);
    }
  };

  return (
    <Paper shadow="sm" radius="md" p="md" className="todocardpaper">
      <div className="todocard">
        <Modal opened={opened} onClose={close} className="inputmodal" title="Update Todo">
          <LoadingOverlay visible={isLoading} overlayBlur={2} />
          {showSuccessfulNotification && <Notification className="alertbanner" color="teal" withCloseButton={false} radius="md" title="Updated succesfully" />}
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
                value={todoStatus}
                onChange={(e) => setTodoStatus(e.target.value)}
              />
              <Button className="submitbutton" type="submit" size="xs">Submit</Button>
            </div>
          </form>
        </Modal>

        <Modal opened={deleteDialog} onClose={toggleDeleteDialog} className="deleteModal" title="Are you sure you want to delete this todo?">
          <LoadingOverlay className="deleteoverlay" visible={deleteOverlay} overlayBlur={2} />
          <Group>
            <Button color="red" radius="xl" onClick={handleDeleteClick}>
              Confirm
            </Button>
            <Button color="teal" radius="xl" onClick={toggleDeleteDialog}>
              Close
            </Button>
          </Group>
        </Modal>

        <div className="todoleft">
          <Text fz="xl" className="todotitle">{todo.title}</Text>
          <Text fz="xs" className="tododesc">{todo.description}</Text>
          <div className="todostatus">
            <Tooltip label={statusToolTip} position="bottom" withArrow>
              <Text fz="xs" className="statustext">Status:</Text>
            </Tooltip>
            {status}
            <Text fz="xs" className="modifiedlabel">
              Last Modified:
            </Text>
            <Text fz="xs" className="datetime">
              {date.toLocaleString()}
            </Text>
          </div>
        </div>
        <div className="todoright">
          <MdOutlineEdit className="editicon" onClick={open} />
          <MdOutlineDeleteOutline className="deleteicon" onClick={toggleDeleteDialog} />
        </div>
      </div>
    </Paper>
  );
}

export default TodoCard;
