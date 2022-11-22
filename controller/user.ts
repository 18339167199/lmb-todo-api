import { User } from '../interface';
import { UserService } from '../service/user';
import { Method } from '../utils/method';
import { Request as R } from '../utils/request';

const { GET, POST, PUT, DELETE } = Method;

export const Controller = {
    
    // 获取用户信息
    '': {
        [GET]: async function(event: any, data: any) {
            const auth = R.getRequestHeaders(event, 'auth');
            return auth;
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
                            email: (user as User).email
                        },
                        auth: JSON.stringify(user)
                        
                    };
                }
                
                throw new Error('username or password error, check and try again!');
                
            } catch (error) {
                throw error;
            }
        }
    }
    
};
