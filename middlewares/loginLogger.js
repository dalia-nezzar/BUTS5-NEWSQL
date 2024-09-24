const Influx = require('influx');

module.exports = async(req,res, next) => {
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

    console.log(req.user._id);
    console.log(req.user.googleId);
    console.log(req.user.displayName);

    try {
        await client.writePoints([
            {
                measurement: 'login_times',
                tags: {user: req.user._id, googleId: req.user.googleId},
                fields: {displayName: req.user.displayName},
                timestamp: new Date()
            }
        ]);

    } catch(err){
        console.log("Erreur écriture Influx"+err);
    } next();
}