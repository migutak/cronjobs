const cron = require('node-cron');
var oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
oracledb.autoCommit = true;
var dbConfig = require('./dbconfig.js');
var fs = require('fs');

// runs dailly 5 am
var task = cron.schedule('0 5 * * *', () => {

    (async function () {
        try {
            connection = await oracledb.getConnection({
                user: dbConfig.user,
                password: dbConfig.password,
                connectString: dbConfig.connectString
            });

            result = await connection.execute("drop table tqall");
            result1 = await connection.execute("drop table tcards");
            console.log('== tqall dropped! and dropped tcards');
            newResult = await connection.execute("create table tqall as select * from qall");
            newResult1 = await connection.execute("create table tcards as select * from qcards where primary = 'P'");
            console.log('== tqall created! and ==== tcards');

        } catch (err) {
            console.error(err);
        } finally {
            if (connection) {
                try {
                    await connection.close();   // Always close connections
                } catch (err) {
                    console.error(err.message);
                }
            }
        }
    })();
});
