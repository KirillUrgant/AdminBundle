all:
	NODE_ENV=production gulp build
	NODE_ENV=production ./node_modules/webpack/bin/webpack.js --config webpack.config.js

dev:
	gulp build
	./node_modules/webpack/bin/webpack.js --config webpack.config.js
