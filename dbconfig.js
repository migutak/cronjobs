module.exports = {
  user: process.env.DB_USER || "ecol",
  password: process.env.DB_PASSWORD || "ecol",//'L#TTc011',
  connectString: process.env.DB_CONNECTIONSTRING || "52.117.54.217:1521/ORCLCDB.localdomain",//"copkprdcont3-scan.co-opbank.co.ke:1559/ECOLLECT",
  servicename: process.env.SERVICENAME || "Letters",
  //RABBITMQ         : process.env.RABBITMQ || 'amqp://guest:guest@ecollectweb.co-opbank.co.ke',
  RABBITMQ         : process.env.RABBITMQ || 'amqp://guest:guest@127.0.0.1'
};
