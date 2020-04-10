import Main from '@/views/Main.vue';

// The pages that are not displayed as subpages of the Main component are written separately, as follows
export const loginRouter = {
    path: '/login',
    name: 'login',
    meta: {
        title: 'Login - log in'
    },
    component: () => import('@/views/login.vue')
};

export const page404 = {
    path: '/*',
    name: 'error-404',
    meta: {
        title: '404-Page does not exist'
    },
    component: () => import('@/views/error-page/404.vue')
};

export const page403 = {
    path: '/403',
    meta: {
        title: '403-Insufficient permissions'
    },
    name: 'error-403',
    component: () => import('@//views/error-page/403.vue')
};

export const page500 = {
    path: '/500',
    meta: {
        title: '500-Server error'
    },
    name: 'error-500',
    component: () => import('@/views/error-page/500.vue')
};

// Routes displayed for the subpage of the Main component but not displayed in the left menu are written in otherRouter
export const otherRouter = {
    path: '/',
    name: 'otherRouter',
    redirect: '/home',
    component: Main,
    children: [
        { path: 'home', title: {i18n: 'home'}, name: 'home_index', meta: {cached: true}, component: () => import('@/views/home/home.vue') },
        { path: 'ownspace', title: 'Account Settings', name: 'ownspace_index', meta: {cached: true}, component: () => import('@/views/own-space/own-space.vue') },
        { path: 'task', title: 'task', name: 'task', meta: {cached: true}, component: () => import('@/views/job/task-info.vue') },
        { path: 'message', title: 'message', name: 'message_index', meta: {cached: true}, component: () => import('@/views/message/message.vue') }
    ]
};

// The route displayed as a subpage of the Main component and displayed in the left menu is written in appRouter
export const appRouter = [
    {
        path: '/job',
        icon: 'arrow-swap',
        name: 'job',
        title: 'Job',
        access: 1,
        component: Main,
        children: [
            { path: 'create', title: 'Job Create', name: 'create', access: 10, meta: {cached: true}, component: () => import('@/views/job/create.vue') },
            { path: 'history', title: 'Job History', name: 'history', access: 11, meta: {cached: true}, component: () => import('@/views/job/history.vue') },
            { path: 'manager', title: 'Job Management', name: 'manager', access: 12, meta: {cached: true}, component: () => import('@/views/job/manager.vue') }
        ]
    },
    {
        path: '/minion',
        icon: 'ios-keypad',
        name: 'minion',
        title: 'Minion Management',
        access: 2,
        component: Main,
        children: [
            { path: 'status', title: 'Status Information', name: 'status', access: 20, meta: {cached: true}, component: () => import('@/views/minion/status.vue') },
            { path: 'key', title: 'Key Management', name: 'key', access: 21, meta: {cached: true}, component: () => import('@/views/minion/key.vue') },
            { path: 'grains', title: 'Grains', name: 'grains', access: 22, meta: {cached: true}, component: () => import('@/views/minion/grains.vue') }
        ]
    },
    {
        path: '/host',
        icon: 'ios-barcode',
        name: 'host',
        title: 'Host Management',
        access: 3,
        component: Main,
        children: [
            { path: 'index', title: 'Host Management', name: 'host_index', access: 30,  meta: {cached: true}, meta: {cached: true}, component: () => import('@/views/host/host.vue') }
        ]
    },
    {
        path: '/group',
        icon: 'social-buffer',
        name: 'group',
        title: 'Group Management',
        access: 4,
        component: Main,
        children: [
            { path: 'index', title: 'Group Management', name: 'group_index', access: 40, meta: {cached: true}, meta: {cached: true}, component: () => import('@/views/groups/groups.vue') }
        ]
    },
    {
        path: '/file',
        icon: 'document-text',
        name: 'file',
        title: 'File Service',
        access: 5,
        component: Main,
        children: [
            // { path: 'pillar_sls', title: 'Pillar SLS', name: 'pillar sls', component: () => import('@/views/my-components/draggable-list/draggable-list.vue') },
            { path: 'index', title: 'File Service', name: 'file_index', access: 50, meta: {cached: true}, component: () => import('@/views/fileserver/gitlab.vue') }
        ]
    },
    {
        path: '/execute',
        icon: 'ios-play',
        name: 'execute',
        title: 'Execute a Command',
        access: 6,
        component: Main,
        children: [
            { path: 'shell', title: 'Shell', name: 'shell', access: 60, meta: {cached: true}, component: () => import('@/views/execute/shell.vue') },
            { path: 'state', title: 'State', name: 'state', access: 61, meta: {cached: true}, component: () => import('@/views/execute/state.vue') },
            { path: 'module', title: 'Module', name: 'module', access: 62, component: () => import('@/views/execute/module.vue') },
            { path: 'pillar', title: 'Pillar', name: 'pillar', access: 63, meta: {cached: true}, component: () => import('@/views/execute/pillar.vue') }
        ]
    },
    {
        path: '/product',
        icon: 'person-stalker',
        name: 'product',
        title: 'Companies',
        access: 7,
        component: Main,
        children: [
            { path: 'index', title: 'Company Management', name: 'product_index', icon: 'social-dropbox', access: 70, meta: {cached: true}, component: () => import('@/views/product/product.vue') }
        ]
    },
    {
        path: '/acl',
        icon: 'person-stalker',
        name: 'acl',
        title: 'ACL Management',
        access: 8,
        component: Main,
        children: [
            { path: 'index', title: 'ACL Management', name: 'acl_index', icon: 'funnel', access: 80, meta: {cached: true}, component: () => import('@/views/acl/acl.vue') }
        ]
    },
    {
        path: '/system',
        icon: 'settings',
        title: 'System Management',
        name: 'system',
        access: 100,
        component: Main,
        children: [
            { path: 'user', title: 'User Management', name: 'user', access: 100, meta: {cached: true}, component: () => import('@/views/user/user.vue') },
            { path: 'role', title: 'Role Management', name: 'role', access: 101, meta: {cached: true}, component: () => import('@/views/role/role.vue') },
            // { path: 'token', title: 'Token Management', name: 'token', access: 102, component: () => import('@/views/error-page/error-page.vue') },
            { path: 'log', title: 'Audit Log', name: 'log', access: 103, meta: {cached: true}, component: () => import('@/views/audit_log/audit_log.vue') },
            { path: 'tools', title: 'System Tools', name: 'tools', access: 104, meta: {cached: true}, component: () => import('@/views/system/tool.vue') }
        ]
    }
];

// All the routes defined above must be written in the following routers
export const routers = [
    loginRouter,
    otherRouter,
    ...appRouter,
    page500,
    page403,
    page404
];
