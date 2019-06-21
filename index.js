const xt = require("itoolkit");

let xml = {};
let xtoptions = {};

function configure(config) {
	xml = {
		username: config.username,
		password: config.password
	};
	xtoptions = {
		"host": config.host,
		"port": config.port,
		"path": config.path
	};
}

function getConnection() {
	return {
		toolkit: xt,
		run: runPGM
	};
}

function runPGM(pgm) {
	return new Promise((resolve, reject) => {
			const conn = new xt.iConn("*LOCAL", xml.username, xml.password, xtoptions);

			conn.add(pgm);

			conn.run((xmlResponse) => {
				resolve(xmlResponse);
			});
		})
		.then(xmlResponse => {
			const result = xt.xmlToJson(xmlResponse);
			if (result == null || result.length < 1) {
				throw APIError(500, xmlResponse);
			}

			let errorsExist = result.reduce((acc, cur) => {
				return cur.success ? acc : true;
			}, false);
			if (errorsExist) {
				throw APIError(500, xmlResponse);
			}

			// result[1].result is the result of the SQL query
			const response = [];
			for (let i = 0; i < result.length; i++) {
				response[i] = {};
				for (let param of result[i].data) {
					response[i][param.name] = param.value.trim();
				}
			}
			return response;
		});
}

module.exports = {
	getConnection,
    runPGM,
    configure
}