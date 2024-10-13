import axios, { AxiosError } from 'axios';
import { IContactFormData, ContactResponse } from '@/interfaces/data.interfaces';

const $URL = process.env.NEXT_PUBLIC_API_URL_MAIL;

export const sendEmail = {
    sendContactEmail: async (contactData: IContactFormData): Promise<ContactResponse> => {
        try {
            const response = await axios.post<ContactResponse>(`${$URL}/send-email`, contactData);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ContactResponse>;
                if (axiosError.response) {
                    throw new Error(axiosError.response.data.error || 'Error sending message');
                } else if (axiosError.request) {
                    throw new Error('Could not connect to the server');
                }
            }
            throw new Error('Error processing request');
        }
    }
};
