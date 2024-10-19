const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'production',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.bundle.js',
  },
  target: 'node', // Especifica que el objetivo es Node.js
  resolve: {
    fallback: {
      zlib: false, // Excluye zlib del paquete
    },
  },
  module: {
    rules: [
      {
        test: /\.node$/,
        // exclude: /node_modules/, // Excluye archivos .node en node_modules
        use: {
          loader: 'ignore-loader', // Ignora estos archivos durante el empaquetado
        },
      },
    ],
  },
  externals: [nodeExternals({
    allowlist: [
      '@sentry/node',
      '@sentry/profiling-node',
      'cors',
      'express',
      'express-oauth2-jwt-bearer',
      'helmet',
      'joi',
      'assert',
      /^@hapi/
    ]
  })], // Incluye los paquetes de producción
};
