const Hapi = require("@hapi/hapi");
const Good = require("@hapi/good");
const Vision = require("@hapi/vision");
const Blipp = require("blipp");
const HapiSwagger = require("hapi-swagger");
const Inert = require("@hapi/inert");
const Package = require("./package");
const { get } = require("request-promise");

const init = async () => {
	const server = Hapi.server({
		port: 3001,
		host: "localhost",
		routes: {
			cors: {
				origin: ["*"], // an array of origins or 'ignore'
			},
		},
	});
	//registro de modulos
	await server.register([
		Blipp,
		Inert,
		Vision,
		{
			plugin: HapiSwagger,
			options: {
				info: {
					title: "Info Indicadores financieros",

					version: Package.version,
				},
			},
		},
		{
			plugin: Good,
			options: {
				ops: {
					interval: 1000 * 30,
				},
				reporters: {
					myConsoleReporter: [
						{
							module: "@hapi/good-squeeze",
							name: "Squeeze",
							args: [{ ops: "*", log: "*", error: "*", response: "*" }],
						},
						{
							module: "@hapi/good-console",
						},
						"stdout",
					],
				},
			},
		},
		//requerir rutas
	]);
	await server.register([require("./routes/bcentral.routes")]);

	const getSeries = async () => {
		const yen = await getYenValue();
		const series_chile = await getSeriesChile();
		return { yen, series_chile };
	};

	server.route({
		method: "*",
		path: "/{any*}",
		handler: function (request, h) {
			return "404 Error! Page Not Found!";
		},
		options: {
			description: "manager 404 routes",
			tags: ["api"],
		},
	});
	await server.start();
	//console.log("Server running on :", server.info.uri);
};

init();
