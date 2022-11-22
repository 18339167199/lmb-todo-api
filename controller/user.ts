import { User } from '../interface';
import { UserService } from '../service/user';
import { Method } from '../utils/method';

const { GET, POST, PUT, DELETE } = Method;

export const Controller = {
    
    // 获取用户信息
    '': {
        [GET]: async function(event: any, data: any) {
            try {
                const auth = event.auth;
                const userId = auth.id;
                const user = await UserService.getById(userId);
                return {
                    username: (user as User).username,
                    nikeName: (user as User).nikeName,
                    email: (user as User).email,
                    createTime: (user as User).createTime,
                    updateTime: (user as User).updateTime
                }
            } catch (error) {
                throw error;
            }
        }
    },
    
    // 注册
    '/register': {
        [POST]: async function(event: any, data: any) {
            try {
                const addUserResult = await UserService.add(data);
                return addUserResult;
            } catch (error) {
                throw error;
            }
        }
    },
    
    // 登录
    '/login': {
        [POST]: async function(event: any, data: any) {
            try {
                const { username, password } = data;
                if (!username || !password) {
                    throw new Error('username or password is empty!');
                }
                
                const user = await UserService.getByUsernameAndPassword(username, password);
                if (user) {
                    // 登录成功
                    return {
                        userInfo: {
                            username: (user as User).username,
                            nikeName: (user as User).nikeName,
                            email: (user as User).email,
                            password: ''
                        },
                        auth: {
                            token: JSON.stringify(user),
                            expired: Date.now() + 30*24*60*60*1000
                        }
                    };
                }
                
                throw new Error('username or password error, check and try again!');
                
            } catch (error) {
                throw error;
            }
        }
    }
    
};
