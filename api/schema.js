const graphql = require("graphql");
const sqlite3 = require("sqlite3").verbose();

const database = new sqlite3.Database("/home/ben/weather.sqlite");

const WeatherType = new graphql.GraphQLObjectType({
  name: "Weather",
  fields: {
    time: { type: graphql.GraphQLID },
    rainMm: { type: graphql.GraphQLFloat },
    windMaxMS: { type: graphql.GraphQLFloat },
    windAvgMS: { type: graphql.GraphQLFloat },
    humidity: { type: graphql.GraphQLFloat },
    tempOutdoor: { type: graphql.GraphQLFloat },
    windDirDeg: { type: graphql.GraphQLFloat },
    luxIndoor: { type: graphql.GraphQLFloat },
    rgbIndoor: { type: graphql.GraphQLList(graphql.GraphQLInt) },
    tempIndoor: { type: graphql.GraphQLFloat },
    pressure: { type: graphql.GraphQLFloat },
  },
});

const queryType = new graphql.GraphQLObjectType({
  name: "Query",
  fields: {
    Weather: {
      type: graphql.GraphQLList(WeatherType),
      args: {
        from: {
          type: graphql.GraphQLID,
        },
        to: {
          type: graphql.GraphQLID,
        },
      },
      resolve: (root, { from, to }, context, info) => {
	const now = Math.ceil(Date.now() / 1000);
        return new Promise((resolve, reject) => {
          database.all(
	    `SELECT 
				time,
				rain_mm as rainMm,
				wind_max_m_s as windMaxMS,
				wind_avg_m_s as windAvgMS,
				humidity,
				temp_outdoor as tempOutdoor,
				wind_dir_deg as windDirDeg,
				lux_indoor as luxIndoor,
				rgb_indoor as rgbIndoor,
				temp_indoor as tempIndoor,
				pressure	
			FROM 
				weather  
			WHERE 
				time >= (?) AND time <= (?) 
			ORDER BY 
				time DESC ;`,
            [from || now - 100, to || now],
            (err, rows) => {
              if (err) {
                reject([]);
              }

	      const returnRows = rows.map((row) => ({
                ...row,
                rgbIndoor: row.rgbIndoor.split(","),
              }))

              if (!from && !to) {
		resolve([returnRows[0]]);
	      }

              resolve(returnRows);
            }
          );
        });
      },
    },
  },
});

const schema = new graphql.GraphQLSchema({
  query: queryType,
});

module.exports = {
  schema,
};
