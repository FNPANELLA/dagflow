import axios from 'axios';

const client = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
    headers: {
        'Content-Type': 'application/json',
    }
});

export const getWorkflows = () => client.get('workflows/');
export const createWorkflow = (data) => client.post('workflows/', data);

// ¡Nueva función!
export const saveWorkflowGraph = (id, nodes, edges) => {
    return client.post(`workflows/${id}/save_graph/`, {
        nodes,
        edges
    });
};

export default client;
export const runWorkflow = (id) => client.post(`workflows/${id}/run/`);
