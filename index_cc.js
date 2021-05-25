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
currentDate(); // 0 6 * * *
//var task = cron.schedule('0 6 * * *', () => {
    (async function() {
        try {
          connection = await oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
          });
          
          cureresult = await connection.execute("update demandsduecc set status = 'self cure' where status = 'pending' and cardacct not in (select cardacct from cards_stage)");
          console.log('self cure update ___ on ' + new Date());      
          result = await connection.execute("select * from autoletters where active = 'true'");
          for (i=0; i<result.rows.length; i++) {
              const memogrp = result.rows[i].MEMOGROUP;
              const daysinarr = result.rows[i].DAYSINARR;
              const letterid = result.rows[i].LETTERID;
              
              const sqlInsert = "select cardacct,cardnumber,cardname, accountno, nationid, exppmnt, limit, outbalance, nvl(address,0) address, city, rpcode, tel, mobile, DAYSINARREARS, EMAIL, CARDSTATUS,CYCLE, '"+letterid+"' demand, cycle, colofficer from tcards where cycle = '" + memogrp + "' and DAYSINARREARS = " + daysinarr;
              selectResult = await connection.execute(sqlInsert);
                for (x=0; x<selectResult.rows.length; x++) {
                  // console.log('insert starts ....');
                  var insertSQL = "insert into demandsduecc(cardacct, cardnumber, cardname, accountno,nationid, exppmnt, limit, outbalance, address, city, rpcode, tel, mobile, DAYSINARREARS, EMAILADDRESS, CARDSTATUS, CYCLE, DATEDUE, COLOFFICER, DEMANDLETTER, status) "+ 
                  " values('" + selectResult.rows[x].CARDACCT + "','"+selectResult.rows[x].CARDNUMBER+"','"+(selectResult.rows[x].CARDNAME).replace(/'/g,'')+"','"+selectResult.rows[x].ACCOUNTNO+"','"+selectResult.rows[x].NATIONID+"','"+selectResult.rows[x].EXPPMNT+"','"+selectResult.rows[x].LIMIT+"','"+(selectResult.rows[x].OUTBALANCE)+"','"+(selectResult.rows[x].ADDRESS).replace(/'/g,'')+"','"+selectResult.rows[x].CITY+"','"+selectResult.rows[x].RPCODE+"','"+selectResult.rows[x].TEL+"','"+selectResult.rows[x].MOBILE+"','"+selectResult.rows[x].DAYSINARREARS+"','"+selectResult.rows[x].EMAILADDRESS+"','"+selectResult.rows[x].CARDSTATUS+"','"+selectResult.rows[x].CYCLE+"','"+currentDate()+"','"+selectResult.rows[x].COLOFFICER+"','"+selectResult.rows[x].DEMAND+"', 'pending')"
                  console.log(insertSQL);
                  insertSQLrs = await connection.execute(insertSQL);  
                  console.log('insert end ....' + x);
                };
          };
          console.log('demandsduecc insert complete ___ on ' + new Date());
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

//});
console.log('[' + dbConfig.servicename + '] cronjob service started at '  + new Date());