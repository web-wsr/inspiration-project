const User = require('../../model/user')
const userRole = require('../../model/user_role');
const Role = require('../../model/role');
const schema = require('async-validator').default

const managerController = {
    managerList: async function (req, res, next) {
        const page = req.query.page || 1;
        const size = req.query.pageSize || 10;
        const skip = (page - 1) * size;
        console.log(page, size);
        try {
            // 获取所有创建的角色供选择
            // const roles = await Role.all();
            // 获取所有用户ID和角色ID
            const userRoles = await userRole.all()
            const userIds = Array.from(new Set(userRoles.map(data => data.user_id)))
            const roleIds = Array.from(new Set(userRoles.map(data => data.role_id)))

            const allUsers = await User.knex().whereIn('id', userIds)
            // console.log(allUsers);
            const allRoles = await Role.knex().whereIn('id', roleIds)
            // console.log(allRoles);
            // 初始化定义admins的数组对象，消除作用域的影响
            let admins = []
            // 构建管理员列表，其中包含每个用户的详细信息以及角色信息
            admins = allUsers.map(user => {
                // 找到与当前用户关联的所有角色ID
                const userRoleIds = userRoles.filter(data => data.user_id === user.id).map(item => item.role_id)
                // 从所有角色中筛选出与当前用户关联的角色
                const userRolesData = allRoles.filter(role => userRoleIds.includes(role.id))
                // 取出对应的角色名称
                const rolesName = userRolesData.map(role => role.name)
                return {
                    id: user.id,
                    //    name:user.name,
                    //    phone:user.phone,
                    roles: rolesName
                }
            })
            console.log(admins);

            const total = await User.count();
            // 创建用户ID到角色数据的映射表
            const userToRolesMap = {};
            admins.forEach(admin => {
                userToRolesMap[admin.id] = admin.roles;
            });
            // 查询分页后的管理员列表
            const users = await User.all().orderBy('id').offset(skip).limit(size); // 使用 Knex.js 分页查
            // 合并角色信息到分页查询结果中
            users.forEach(user => {
                if (userToRolesMap[user.id]) {
                    user.roles = userToRolesMap[user.id];
                } else {
                    user.roles = []; // 如果没有角色，则设置为空数组
                }
            });

            res.json({
                code: 200,
                data: users,
                total
            })
        } catch (e) {
            res.json({
                code: 0,
                data: e
            })
        }
    },
    managerAdd: async function (req, res, next) {
        const name = req.body.name;
        const phone = req.body.phone;
        const roleIds = req.body.roleIds;
        console.log(name, phone, roleIds);

        // 验证请求参数
        const validator = new schema({
            name: { type: 'string', required: true },
            phone: { type: 'string', required: true },
            roleIds: { type: 'array', required: true }
        });

        const params = { name, phone, roleIds };
        try {
            await validator.validate(params);

            // 通过 phone 查询用户
            const existingUser = await User.where({ phone: phone });
            console.log(existingUser);

            let userId;
            if (existingUser && existingUser.length > 0) {
                // 如果用户已存在，直接获取其 ID
                // 获取的是数组对象，要注意
                userId = existingUser[0].id;
            } else {
                // 如果用户不存在，创建新用户并获取其 ID
                const newUser = await User.insert({ name, phone });
                userId = newUser[0].id;
            }
            console.log(userId);
            // 检查用户是否已有角色关联
            const existingRoles = await userRole.where({ user_id: userId });
            if (existingRoles.length > 0) {
                return res.json({ error_code: 1, message: '该用户已有角色关联' });
            }

            // 设置数据表user_roles 中的数据，绑定用户 ID 和其关联的角色 ID
            await userRole.insert(roleIds.map(id => {
                return {
                    user_id: userId,
                    role_id: id
                };
            }));

            res.json({ code: 200, message: '管理员创建成功' });
        } catch (e) {
            res.json({ error_code: 1, message: e.message || e.errors });
        }
    },
    managerUpdate: async function (req, res, next) {
        const userId = req.params.id;
        const name = req.body.name;
        const phone = req.body.phone;
        const roleIds = req.body.roleIds;

        try {
            // 验证请求参数
            const validator = new schema({
                name: { type: 'string', required: true },
                phone: { type: 'string', required: true },
                roleIds: { type: 'array', required: true }
            });

            const params = { name, phone, roleIds };
            await validator.validate(params);

            // 更新用户信息
            await User.update(userId, { name, phone })

            // 获取当前用户
            const originRoles = await userRole.where({ user_id: userId });
            console.log(originRoles);
            // 获取当前用户的角色id
            const originIds = originRoles.map(data => data.role_id)
            console.log(originIds);

            // 计算需要添加和删除的角色
            const rolesToAdd = roleIds.filter(id => !originIds.includes(id));
            console.log(rolesToAdd);
            const rolesToDelete = originIds.filter(id => !roleIds.includes(id));
            console.log(rolesToDelete);

            // 删除不再需要的角色关联
            if (rolesToDelete.length > 0) {
                await userRole.where({ user_id: userId }).whereIn('role_id', rolesToDelete).del();
            }

            // 添加新角色关联
            if (rolesToAdd.length > 0) {
                await userRole.insert(rolesToAdd.map(id => ({ user_id: userId, role_id: id })));
            }

            res.json({ code: 200, message: '管理员信息更新成功' });
        } catch (e) {
            res.json({ error_code: 1, message: e.message || e.errors });
        }
    },
    managerDelete: async function (req, res, next) {
        const userId = req.params.id;
        try {
            // 删除用户
            await User.delete(userId);

            // 删除用户关联的角色
            await userRole.where({ user_id: userId }).del();

            res.json({ code: 200, message: '管理员删除成功' });
        } catch (e) {
            res.json({ error_code: 1, message: e.message });
        }
    }
}

module.exports = managerController