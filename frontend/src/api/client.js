import axios from 'axios';

const client = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/', // La URL de tu Django
    headers: {
        'Content-Type': 'application/json',
    }
});

export const getWorkflows = () => client.get('workflows/');
export const createWorkflow = (data) => client.post('workflows/', data);

export default client;