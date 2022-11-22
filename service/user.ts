import { User } from '../interface';
import { db } from '../utils/db.js';
import { getCurrentDateStr } from '../utils/utils.js';
const TableName = 'lmb-todo-users';

export const UserService = {
    
    // 获取全部的用户
    getAll() {
        return new Promise((resolve, reject) => {
            db.scan({
                TableName,
                FilterExpression: 'username = :username',
                ExpressionAttributeValues: {
                    ':username': 'root112'
                }
            }, function(error, data) {
                error ? reject(error) : resolve(data);
            });
        });
    },
    
    // 根据 id 查询用户
    getById(id: number) {
        return new Promise((resolve, reject) => {
            db.scan({
                TableName,
                FilterExpression: 'id = :id',
                ExpressionAttributeValues: {
                    ':id': id
                }
            }, (error, data) => {
                error ? reject(error) : resolve(data && data.Items && data.Items[0] ? data.Items[0] : null);
            });
        });
    },
    
    // 根据 username 和 password 查找用户
    getByUsernameAndPassword(username: string, password?: string) {
        let attr: { [propName: string]: string } = { ':username': username };
        password && (attr[':password'] = password);
        return new Promise((resolve, reject) => {
            db.scan({
                TableName,
                FilterExpression: password ? 'username = :username AND password = :password' : 'username = :username',
                ExpressionAttributeValues: attr
            }, (error, data) => {
                error ? reject(error) : resolve(data && data.Items && data.Items[0] ? data.Items[0] : null);
            });
        });
    },
    
    // 新增用户
    async add(user: User) {
        const { username, password, email, nikeName } = user;
        if (!username || !password) {
            throw new Error('username or password is empty!');
        }
        
        const isUsernameExist = await this.getByUsernameAndPassword(username);
        if (isUsernameExist) {
            throw new Error(`username ${username} is already exist!`);
        }

        let Item = {
            id: Date.now(),
            username,
            password,
            email: email ? email : '',
            nikeName: nikeName ? nikeName : '',
            createTime: getCurrentDateStr(),
            updateTime: '',
        };
        return new Promise((resolve, reject) => {
            db.put(
                { TableName, Item },
                (error, data) => {
                    error ? reject(error) : resolve(Item);
                }
            );  
        });
    }

};
