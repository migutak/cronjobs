const cron = require('node-cron');
var oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
oracledb.autoCommit = true;
var dbConfig = require('./dbconfig.js');

function currentDate() {
  var d = new Date(), month = '' + (d.getMonth() + 1), day = '' + d.getDate(), year = '' + d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-')
};
currentDate();
// var task = cron.schedule('0 7 * * 1-6', () => {
  // update self cure
 (async function() {
        try {
          connection = await oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
          });
          
          cureresult = await connection.execute("update demandsdue set status = 'self cure' where status = 'pending' and accnumber not in (select accnumber from loans_stage)");
          console.log('self cure update ___ on ' + new Date());      
          result = await connection.execute("select * from autoletters where active = 'true'");
          for (i=0; i<result.rows.length; i++) {
              const memogrp = result.rows[i].MEMOGROUP;
              const daysinarr = result.rows[i].DAYSINARR;
              const letterid = result.rows[i].LETTERID;
              
              const sqlInsert = "select accnumber,custnumber,nvl(client_name,0) client_name, section, oustbalance, instamount totalarrears, daysinarr, nvl(addressline1,0) address, postcode postalcode, telnumber, emailaddress, colofficer, branchcode, rrocode, arocode, '"+letterid+"' demand from tqall where substr(accnumber,3,3) = '" + memogrp + "' and daysinarr = " + daysinarr;
              selectResult = await connection.execute(sqlInsert);
                console.log(currentDate() + '_total_letters_is_' + i, selectResult.rows);
                for (x=0; x<selectResult.rows.length; x++) {
                  // console.log('insert starts ....');
                  var insertSQL = "insert into demandsdue(accnumber, custnumber, client_name, section, oustbalance, totalarrears, daysinarr, address, postalcode, telnumber, emailaddress, datedue, colofficer, branchcode, rrocode, arocode, demandletter, status) "+ 
                  " values('" + selectResult.rows[x].ACCNUMBER + "','"+selectResult.rows[x].CUSTNUMBER+"','"+(selectResult.rows[x].CLIENT_NAME).replace(/'/g,'')+"','"+selectResult.rows[x].SECTION+"','"+selectResult.rows[x].OUSTBALANCE+"','"+selectResult.rows[x].TOTALARREARS+"','"+selectResult.rows[x].DAYSINARR+"','"+(selectResult.rows[x].ADDRESS).replace(/'/g,'')+"','"+selectResult.rows[x].POSTALCODE+"','"+selectResult.rows[x].TELNUMBER+"','"+selectResult.rows[x].EMAILADDRESS+"','"+currentDate()+"','"+selectResult.rows[x].COLOFFICER+"','"+selectResult.rows[x].BRANCHCODE+"','"+selectResult.rows[x].RROCODE+"','"+selectResult.rows[x].AROCODE+"','"+selectResult.rows[x].DEMAND+"', 'pending')"
                  console.log(insertSQL);
                  insertSQLrs = await connection.execute(insertSQL);  
                  console.log('insert end ....' + x);
                };
          };
          console.log('demandsdue insert complete ___ on ' + new Date());
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
// });

console.log('.... running ....');

