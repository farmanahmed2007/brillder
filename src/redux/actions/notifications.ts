import axios from 'axios';
import { Action, Dispatch } from 'redux';
import { Notification } from '../../model/notifications';

import types from '../types';

const getNotificationsSuccess = (notifications: any) => {
    return {
        type: types.GET_NOTIFICATIONS_SUCCESS,
        notifications
    } as Action;
}

const getNotificationsFailure = (errorMessage: string) => {
    return {
        type: types.GET_NOTIFICATIONS_FAILURE,
        error: errorMessage
    } as Action;
}

const getNotifications = () => {
    return function (dispatch: Dispatch) {
        return axios.get(
            `${process.env.REACT_APP_BACKEND_HOST}/notifications/unread`,
            { withCredentials:true }
        ).then(response => {
            const {data} = response;
            dispatch(getNotificationsSuccess(data));
        }).catch(error => {
            dispatch(getNotificationsFailure(error.message));
        });
    }
}

const receivedNotification = (notification: Notification) => {
    return {
        type: types.RECEIVED_NOTIFICATION,
        notification
    } as Action;
}

const notificationClear = (notificationId: number) => {
    return {
        type: types.NOTIFICATION_CLEAR,
        notificationId
    } as Action;
}

const notificationClearAll = () => {
    return {
        type: types.NOTIFICATION_CLEAR_ALL
    } as Action;
}

export default { getNotifications, receivedNotification, notificationClear }