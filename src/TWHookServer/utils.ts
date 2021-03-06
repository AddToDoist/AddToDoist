import axios from 'axios';
import Client from 'todoist-rest-client';
import { TWDirectMessage, URLEntity } from './DirectMessages';

export const getProjectNumFromMessage = ( message: string ): [boolean, number] => {
  const projectNum = message.split(' ')[1];
  // regex for digit: /^\d+$/
  const isValidProjectNum = projectNum?.match(/^\d+$/);

  if (!isValidProjectNum) return [false, NaN];
  return [true, +isValidProjectNum[0]];
};

export const getMessageWithoutURL = ( message: TWDirectMessage, URLEntity: URLEntity): string => {
  const textWithoutURL = message.message_data.text.slice(0, URLEntity.indices[0]).trim();
  const taskText = `[${textWithoutURL}](${URLEntity.expanded_url})`;
  return taskText;

};

// export const quickAddTodoistTask = (text: string, token: string) => {
//   return fetch('https://api.todoist.com/sync/v8/quick/add', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({ text }),
//   });
// };

export const getTodoistUserData = async (token: string) => {
  const { data } = await axios.post('https://api.todoist.com/sync/v8/sync',
    { sync_token: '*', resource_types: ['user'] },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  const {user} = data;
  return user;
};

export const addTodoistTask = ({content, token, projectId}: {content: string, token: string, projectId?: number}) => {
  const tdsClient = Client(token);
  return tdsClient.task.create({
    content,
    project_id: projectId,
  });
};

export const getTodoistProjects = (token: string) => {
  const tdsClient = Client(token);
  return tdsClient.project.getAll();
};

export const revokeAccessToken = async (token: string) => {
  const revokeUrl = 'https://api.todoist.com/sync/v8/access_tokens/revoke';
  const { status } = await axios.post(revokeUrl, {
    client_id: process.env.TODOIST_CLIENT_ID,
    client_secret: process.env.TODOIST_CLIENT_SECRET,
    access_token: token,
  });

  if (status === 204) return true;
  return false;

};