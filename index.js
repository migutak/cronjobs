const cron = require('node-cron');
var oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
oracledb.autoCommit = true;
var dbConfig = require('./dbconfig.js');

var task = cron.schedule('* * * * *', () => {

    (async function() {
        try {
          connection = await oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
          });
      
          result = await connection.execute("select * from autoletters where active = 'true'");
          overalResult = [];
          for (i=0; i<result.rows.length; i++) {
              const memogrp = result.rows[i].MEMOGROUP;
              const daysinarr = result.rows[i].DAYSINARR;
              const letterid = result.rows[i].LETTERID;
              
              const sqlInsert = "select accnumber,custnumber,daysinarr, '"+letterid+"' demand from tqall where substr(accnumber,3,3) = '" + memogrp + "' and daysinarr = " + daysinarr;
              selectResult = await connection.execute(sqlInsert);
                for (x=0; x<selectResult.rows.length; x++) {
                  // console.log('insert starts ....');
                  var insertSQL = "insert into test(accnumber,custnumber,daysinarr,demand) values('" + selectResult.rows[x].ACCNUMBER + "','"+selectResult.rows[x].CUSTNUMBER+"','"+selectResult.rows[x].DAYSINARR+"','"+selectResult.rows[x].DEMAND+"')"
                  console.log(insertSQL);
                  insertSQLrs = await connection.execute(insertSQL);  
                  console.log('insert end ....' + x);
                };
          };
          // data = await connection.execute(sql);
          //
          
      
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

    function doRelease(connection) {
        connection.close(
            function (err) {
                if (err)
                    console.error(err.message);
            });
    }
});