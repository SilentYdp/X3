module.exports = {
    apps: [
        {
            name: 'client',
            script: 'npm',
            args: 'start',
            cwd: './', // 设置工作目录为项目根目录
            watch: ['src', 'public'],
            ignore_watch: ['node_modules'],
            env: {
                PORT: 9601,
                NODE_ENV: 'development'
            }
        },
        {
            name: 'server',
            script: 'node',
            args: 'server.js',
            cwd: './backend', // 设置工作目录为backend目录
            watch: ['backend'],
            ignore_watch: ['node_modules'],
            env: {
                NODE_ENV: 'development'
            }
        }
    ]
};
