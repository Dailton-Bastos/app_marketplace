const express = require('express');
const mongoose = require('mongoose');
const Youch = require('youch');
const validate = require('express-validation');
const databaseConfig = require('./config/database');

class App {
	constructor() {
		this.express = express();
		this.isDev = process.env.NODE_ENV !== 'production';

		this.middlewares();
		this.database();
		this.routes();
		this.exception();
	}

	database() {
		mongoose.connect(databaseConfig.uri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		});
	}

	middlewares() {
		this.express.use(express.json());
	}

	routes() {
		this.express.use(require('./routes'));
	}

	exception() {
		this.express.use(async (err, req, res, next) => {
			if (err instanceof validate.ValidationError) {
				return res.status(err.status).json(err);
			}

			if (process.env.NODE_ENV !== 'production') {
				const youch = new Youch(err, req);

				return res.json(await youch.toJSON());
			}

			return res.status(err.status || 500).json({
				error: 'Internal Server Error',
			});
		});
	}
}

module.exports = new App().express;
