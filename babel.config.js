module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    ['module-resolver', {
      root: ['./'],
      alias: {
        '@src': './src',
        '@components': './src/components',
        '@hooks': './src/hooks',
        '@services': './src/services',
        '@constants': './src/constants',
        '@types': './src/types'
      }
    }]
  ]
}
