import apiClient from './apiClient';

export const getWhatsAppStatus = async () => {
    const response = await apiClient.get('/whatsapp/status');
    return response.data;
};

export const getWhatsAppQRCode = async () => {
    const response = await apiClient.get('/whatsapp/connect');
    return response.data;
};

export const disconnectWhatsApp = async () => {
    const response = await apiClient.post('/whatsapp/disconnect');
    return response.data;
};

export const sendWhatsAppReport = async (data) => {
    const response = await apiClient.post('/whatsapp/send', data);
    return response.data;
};
