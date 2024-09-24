const Influx = require("influx");
const moment = require("moment-timezone");

const client = new Influx.InfluxDB({
    host: 'localhost',
    database: 'newsql_db',
    port: 8086,
    schema: [
        {
            measurement: 'login_times',
            fields: {displayName: Influx.FieldType.STRING},
            tags: ['user','googleId']
        }]
});

module.exports = app => {
    app.get("/api/logins", (req, res) => {
        client.query(`select * from login_times ORDER BY time DESC tz('Europe/Paris')`)
            .then(result => {
                res.status(200).json(result)
            }).catch(error => {
            res.status(500).send({"internal error": error});
        })
    });
    app.get("/api/logins/minutes", (req,res)=> {
        let timeMin = "5m";
        client.query(`SELECT COUNT(displayName) FROM login_times 
                            WHERE time > now() - 90m
                            GROUP BY time(${timeMin})
                            ORDER BY time DESC tz('Europe/Paris')`
        ).then(results => {
            const resultsNew = results.map(result => {
                const date = moment(result.time).tz("Europe/Paris").format("HH:mm");
                return {time: date, count: result.count}
            });
            res.status(200).json(resultsNew);
        }).catch(error => {
            res.status(500).send({"Internal Error": error});
        })
    })
}