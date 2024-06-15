import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const config = {
  entry: './src/index.tsx', // Entry point of your application
  output: {
    path: path.resolve(__dirname, 'src'), // Output directory
    filename: 'bundle.js', // Output filename
    publicPath: '/', // Public URL of the output directory
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'], // Resolve TypeScript and JavaScript files
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true, // Enable fast transpilation by type checking in a separate process
          },
        },
      },
      // Add other loaders for handling CSS, images, etc. as needed
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // HTML template for HtmlWebpackPlugin
    }),
    new ForkTsCheckerWebpackPlugin({
      async: false, // Ensure webpack doesn't continue until type checking is complete
    }),
  ],
};

export default config;
