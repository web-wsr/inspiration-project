const Role = require('../../model/role');
const userRole = require('../../model/user_role')
const rolePermission = require('../../model/role_permission')
const Permission = require('../../model/permission')
const PermissionGroup = require('../../model/permission_group')
const schema = require('async-validator').default

const roleController = {
    roleList: async function (req, res, next) {
        const page = req.query.page || 1;
        const size = req.query.pageSize || 10;
        const skip = (page - 1) * size;
        try {
            const total = await Role.count();
            // 查询分页后的角色列表
            const roles = await Role.all().orderBy('id').offset(skip).limit(size); // 使用 Knex.js 分页查
            res.json({
                code: 200,
                data: roles,
                total
            })
        } catch (e) {
            res.json({
                code: 0,
                data: e
            })
        }
    },
    addRole: async function (req, res, next) {
        const description = req.body.description
        const slug = req.body.slug
        const name = req.body.name
        const validator = new schema({
            description: { type: 'string', required: true },
            slug: { type: 'string', required: true },
            name: { type: 'string', required: true }
        })
        const params = {
            description: description,
            slug: slug,
            name: name,
        }
        try {
            await validator.validate(params)
            const ids = await Role.insert({ name: name, slug: slug, description: description })
            console.log(ids);

            const roleId = ids[0]
            res.json({
                code: 200,
                data: { id: roleId },
                message: '添加成功'
            })
        } catch (e) {
            res.json({
                error_code: 1,
                message: e.message || e.errors
            })
        }
    },
    updateRole: async function (req, res, next) {
        const id = req.params.id
        const description = req.body.description
        const slug = req.body.slug
        const name = req.body.name
        const validator = new schema({
            description: { type: 'string', required: true },
            slug: { type: 'string', required: true },
            name: { type: 'string', required: true }
        })
        const params = { name, description, slug };
        try {
            // 验证请求参数
            await validator.validate(params)
            // 修改角色信息
            await Role.update(id, { name: name, description: description, slug: slug });
            res.json({ code: 200, message: '更新角色信息成功' })
        } catch (e) {
            res.json({ error_code: 1, message: e.message || e.errors })
        }
    },
    deleteRole: async function (req, res, next) {
        const id = req.params.id
        try {
            await Role.knex().where({ id: id }).del()
            res.json({ code: 200, message: '删除角色成功' })
        } catch (e) {
            res.json({ error_code: 1, message: e.message || e.errors })
        }
    },
    getEnableRoleList: async function (req, res, next) {
        try {
            const roles = await Role.all();
            res.json({
                code: 200,
                data: roles
            })
        } catch (e) {
            res.json({ error_code: 1, message: e.message || e.errors })
        }
    },
    getRolePermissions: async function (req, res, next) {
        const id = req.params.id
        try {
            // const role = await Role.find(id)
            // const permissions = await rolePermission.select({ role_id: id })
            // res.locals.nav = 'role'
            // res.locals.role = role
            // res.locals.permissions = permissions
            // res.render('admin/role_edit.tpl', res.locals)
            const roles = await Role.select({ id })
            const role = roles[0]
            if (!role) {
                res.json({
                    error_code: 1,
                    message: '不存在'
                })
                return;
            }
            // 获取所有权限
            const permissionGroup = await PermissionGroup.all()
            const permissionsAll = await Permission.all()
            const transformPermissionsAll = permissionsAll.map(item => {
                return {
                    ...item,
                    tree_id: item.id
                }
            })
            const permissionGroupDiv = {}
            permissionGroup.forEach(data => {
                data.children = []
                permissionGroupDiv[data.id] = data
            })
            transformPermissionsAll.forEach(data => {
                permissionGroupDiv[data.group_id].children.push(data)
            })

            // const permissionsTransformAll = Object.values(permissionGroupDiv).flatMap(group => group.children || []);
            const permissionsTransformAll = Object.values(permissionGroupDiv);
            console.log(permissionsTransformAll);



            // 获取角色关联的权限
            const permissions = await rolePermission.where({ role_id: id });
            console.log(permissions);
            const permissionsTransform = permissions.map(data => data.permission_id)
            console.log(permissionsTransform);
            res.json({
                code: 200,
                role: role,
                permissionsTransformAll: permissionsTransformAll,
                permissions: permissionsTransform
            })
        } catch (e) {
            res.json({
                error_code: 1,
                message: e.message
            })
        }
    },
    updateRolePermissions: async function (req, res, next) {
        const id = req.params.id;
        const permissions = req.body.permissions;
        console.log(permissions, id);
        const validator = new schema({
            permissions: { type: 'array', required: true },
        })
        const params = { permissions };
        try {
            // 验证请求参数
            await validator.validate(params)
            // 修改角色信息
            // await Role.update(id, { name: name, description: description, slug: slug });
            // 修改角色关联的权限信息
            const originPermissions = await rolePermission.where({ role_id: id })
            console.log(originPermissions);
            const originIds = originPermissions.map(data => data.permission_id)
            console.log(originIds);
            const removeIds = originIds.filter(data => !permissions.includes(data))
            console.log(removeIds);
            const insertIds = permissions.filter(data => !originIds.includes(data))
            console.log(insertIds);
            if (removeIds.length) {
                await rolePermission.knex()
                    .whereIn('permission_id', removeIds)
                    .andWhere('role_id', id)
                    .del()
            }
            if (insertIds.length) {
                await rolePermission.insert(insertIds.map(data => {
                    return {
                        permission_id: data,
                        role_id: id
                    }
                }))
            }
            res.json({ code: 200, message: '分配权限成功' })
        } catch (e) {
            res.json({ error_code: 1, message: e.message || e.errors })
        }
    }

}

module.exports = roleController