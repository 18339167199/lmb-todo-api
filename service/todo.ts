import { Todo } from '../interface/index.js';
import { db } from '../utils/db.js';
import { getCurrentDateStr } from '../utils/utils.js';
const TableName = 'lmb-todo-todos';

export const TodoService = {

    // 按 id 查询待办
    getById(id: number) {
        id = Number(id);
        if (!id) {
            return Promise.reject(new Error('id is empty!'));
        }
        
        return new Promise((resolve, reject) => {
            db.scan({
                TableName,
                FilterExpression: 'id = :id',
                ExpressionAttributeValues: { ':id': id }
            }, (error, data) => {
                error ? reject(error) : resolve(data && data.Items && data.Items.length > 0 ? data.Items[0] : null);
            });
        });
    },

    // 按 groupId 查找待办
    getByGroupId(id: number) {
        id = Number(id);
        if (!id) {
            return Promise.reject(new Error('id is empty!'));
        }
        
        return new Promise((resolve, reject) => {
            db.scan({
                TableName,
                FilterExpression: 'groupId = :id',
                ExpressionAttributeValues: { ':id': id }
            }, (error, data) => {
                error ? reject(error) : resolve(data.Items);
            });
        });
    },

    // 新增待办
    add(todo: Todo) {
        const { content, groupId } = todo;
        if (!content || !groupId) {
            return Promise.reject(new Error('content or groupId is empty!'));
        }
        
        const Item = {
            id: Date.now(),
            groupId,
            done: 0,
            star: 0,
            content,
            note: todo.note || '',
            createTime: getCurrentDateStr(),
            updateTime: '',
            scheduledTime: todo.scheduledTime || ''
        };
        return new Promise((resolve, reject) => {
            db.put(
                { TableName, Item },
                (error, data) => {
                    error ? reject(error) : resolve(Item);
                }
            );
        });
    },

    // 更新待办
    update(todo: Todo) {
        const { id } = todo;
        if (!id) {
            return Promise.reject(new Error('id is empty!'));
        }
        
        todo.id = Number(todo.id);
        todo.updateTime = getCurrentDateStr();
        
        const updateExpression = 'set ' + Object.keys(todo).filter(key => key !== 'id').map(key => `${key} = :${key}`).join(', ');
        const expressionAttributeValues = {};
        
        Object.keys(todo).filter(key => key !== 'id').forEach(key => {
            // @ts-ignore
            expressionAttributeValues[`:${key}`] = todo[key];
        });
        
        return new Promise((resolve, reject) => {
            db.update({
                TableName,
                Key: { id },
                UpdateExpression: updateExpression,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues:"UPDATED_NEW"
            }, (error, data) => {
                error ? reject(error) : resolve(data);
            });
        });
    },

    // 删除待办
    del(todo: Todo) {
        const { id } = todo;
        if (!id) {
            return Promise.reject(new Error('groupId or id is empty!'));
        }
        
        return new Promise((resolve, reject) => {
            db.delete({
                TableName,
                ConditionExpression: 'id = :id',
                ExpressionAttributeValues: { ':id': id },
                Key:{ id: id }
            }, (error, data) => {
                error ? reject(error) : resolve(data);
            });
        });
    },

    // 根据 keyword 模糊搜索
    search(keyword: string) {
        return new Promise((resolve, reject) => {
            db.scan({
                TableName,
                FilterExpression: `contains(content, :keyword)`,
                ExpressionAttributeValues: { ':keyword': keyword }
            }, (error, data) => {
                error ? reject(error) : resolve(data.Items);
            });
        });
    }

};
